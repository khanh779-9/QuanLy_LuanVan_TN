<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Student;
use App\Models\Topic;
use App\Models\Council;
use App\Models\Setting;

class MigrateLegacyData extends Command
{
    protected $signature = 'migrate:legacy-data';
    protected $description = 'Migrate data from legacy database to Laravel database';

    public function handle()
    {
        $this->info('Starting data migration...');

        // Connect to Legacy DB
        $legacyDb = DB::connection('mysql_legacy');

        $stats = [
            'lecturers' => ['legacy' => 0, 'migrated' => 0],
            'students' => ['legacy' => 0, 'migrated' => 0],
            'topics' => ['legacy' => 0, 'migrated' => 0],
            'councils' => ['legacy' => 0, 'migrated' => 0],
        ];

        // 1. Migrate Lecturers (GiangVien) -> Users
        $lecturers = $legacyDb->table('GiangVien')->get();
        $stats['lecturers']['legacy'] = $lecturers->count();

        foreach ($lecturers as $gv) {
            try {
                // Store plaintext password (temporary)
                $password = $gv->matKhau;

                // Handle duplicate email: Check if email exists for DIFFERENT username
                $existingUser = User::where('email', $gv->email)->where('username', '!=', $gv->maGV)->first();
                $email = $gv->email;
                if ($existingUser) {
                    $this->warn("Duplicate email {$email} for Lecturer {$gv->maGV}. Appending ID.");
                    $email = str_replace('@', "+{$gv->maGV}@", $email);
                }

                User::updateOrCreate(
                    ['username' => $gv->maGV],
                    [
                        'name' => $gv->tenGV,
                        'email' => $email,
                        'phone' => $gv->soDienThoai,
                        'degree' => $gv->hocVi,
                        'password' => $password,
                        'role' => 'lecturer',
                    ]
                );
                $stats['lecturers']['migrated']++;
            } catch (\Exception $e) {
                $this->error("Failed to migrate Lecturer {$gv->maGV}: " . $e->getMessage());
            }
        }

        // Ensure Admin exists (not counted in legacy stats)
        try {
            User::firstOrCreate(
                ['username' => 'admin'],
                [
                    'name' => 'Administrator',
                    'email' => 'admin@stu.edu.vn',
                    'password' => '123', // Plaintext password
                    'role' => 'admin'
                ]
            );
        } catch (\Exception $e) {
        }

        // 2. Migrate Students
        $students = $legacyDb->table('SinhVien')->get();
        $stats['students']['legacy'] = $students->count();

        foreach ($students as $sv) {
            try {
                Student::updateOrCreate(
                    ['mssv' => $sv->mssv],
                    [
                        'name' => $sv->hoTen,
                        'class' => $sv->lop,
                        'email' => $sv->email, // Students don't use Auth yet, so duplicate email in 'students' table might be allowed if not unique constrained? 
                        // Migration 'students' table usually has unique email. Let's check schema. 
                        // If schema has unique email, we need to handle it.
                        'phone' => $sv->soDienThoai,
                    ]
                );
                $stats['students']['migrated']++;
            } catch (\Exception $e) {
                // Try unique email fix for student too
                if (str_contains($e->getMessage(), 'Duplicate entry')) {
                    try {
                        $email = str_replace('@', "+{$sv->mssv}@", $sv->email);
                        Student::updateOrCreate(
                            ['mssv' => $sv->mssv],
                            [
                                'name' => $sv->hoTen,
                                'class' => $sv->lop,
                                'email' => $email,
                                'phone' => $sv->soDienThoai,
                            ]
                        );
                        $stats['students']['migrated']++;
                    } catch (\Exception $ex) {
                        $this->error("Failed to migrate Student {$sv->mssv}: " . $ex->getMessage());
                    }
                } else {
                    $this->error("Failed to migrate Student {$sv->mssv}: " . $e->getMessage());
                }
            }
        }

        // 3. Migrate Councils
        if ($legacyDb->getSchemaBuilder()->hasTable('HoiDong')) {
            $councils = $legacyDb->table('HoiDong')->get();
            $stats['councils']['legacy'] = $councils->count();

            foreach ($councils as $hd) {
                try {
                    Council::updateOrCreate(
                        ['name' => $hd->tenHoiDong],
                        ['location' => $hd->diaDiem]
                    );
                    $stats['councils']['migrated']++;
                } catch (\Exception $e) {
                    $this->error("Failed to migrate Council {$hd->tenHoiDong}: " . $e->getMessage());
                }
            }
        }

        // 4. Migrate Topics
        $topics = $legacyDb->table('DeTai')->get();
        $stats['topics']['legacy'] = $topics->count();

        foreach ($topics as $dt) {
            try {
                $lecturer = User::where('username', $dt->maGV_HD)->first();
                $reviewer = User::where('username', $dt->maGV_PB)->first();

                $code = $dt->maMH ?? null;
                if (empty($code))
                    $code = $dt->maDeTai;

                // Safe access helpers
                $trangThaiGK = $dt->trangThaiGiuaKy ?? ($dt->trangThaiGK ?? 'Được làm tiếp');
                $nhanXetGK = $dt->nhanXetGiuaKy ?? ($dt->nhanXetGK ?? null);

                // Try to find other comments if they exist
                $nhanXetPB = $dt->nhanXetPhanBien ?? null;
                $nhanXetHD = $dt->nhanXetHuongDan ?? null;

                $topic = Topic::updateOrCreate(
                    ['code' => $code],
                    [
                        'name' => $dt->tenDeTai,
                        'description' => $dt->moTa ?? '',
                        'lecturer_id' => $lecturer ? $lecturer->id : null,
                        'reviewer_id' => $reviewer ? $reviewer->id : null,
                        'midterm_score' => $dt->diemGiuaKy ?? null,
                        'midterm_status' => $trangThaiGK,
                        'midterm_comment' => $nhanXetGK,
                        'advisor_score' => $dt->diemHuongDan ?? null,
                        // 'advisor_comment' => $nhanXetHD, // Helper if column needed
                        'defense_score' => $dt->diemPhanBien ?? null,
                        'defense_comment' => $nhanXetPB,
                    ]
                );

                // Link Students
                $studentList = $legacyDb->table('SinhVien')->where('maDeTai', $dt->maDeTai)->get();
                foreach ($studentList as $s) {
                    Student::where('mssv', $s->mssv)->update(['topic_id' => $topic->id]);
                }
                $stats['topics']['migrated']++;
            } catch (\Exception $e) {
                $this->error("Failed to migrate Topic {$dt->maDeTai}: " . $e->getMessage());
            }
        }

        // 5. Settings
        try {
            $config = $legacyDb->table('CauHinh')->first();
            if ($config) {
                Setting::updateOrCreate(['id' => 1], ['stage' => $config->giaiDoan]);
            }
        } catch (\Exception $e) {
        }

        // Report
        $this->table(
            ['Entity', 'Legacy Count', 'Migrated Count', 'Status'],
            [
                ['Lecturers', $stats['lecturers']['legacy'], $stats['lecturers']['migrated'], $stats['lecturers']['legacy'] == $stats['lecturers']['migrated'] ? '<info>OK</info>' : '<error>MISMATCH</error>'],
                ['Students', $stats['students']['legacy'], $stats['students']['migrated'], $stats['students']['legacy'] == $stats['students']['migrated'] ? '<info>OK</info>' : '<error>MISMATCH</error>'],
                ['Topics', $stats['topics']['legacy'], $stats['topics']['migrated'], $stats['topics']['legacy'] == $stats['topics']['migrated'] ? '<info>OK</info>' : '<error>MISMATCH</error>'],
                ['Councils', $stats['councils']['legacy'], $stats['councils']['migrated'], $stats['councils']['legacy'] == $stats['councils']['migrated'] ? '<info>OK</info>' : '<error>MISMATCH</error>'],
            ]
        );
    }
}
