<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThesisForm extends Model
{
	protected $table = 'topic_registrations_form';
	protected $primaryKey = 'id';
	public $timestamps = false;

	protected $fillable = [
		'topic_title',
		'topic_description',
		'topic_type',
		'student1_id',
		'student1_name',
		'student1_class',
		'student1_email',
		'student2_id',
		'student2_name',
		'student2_class',
		'student2_email',
		'gvhd_code',
		'gvhd_workplace',
		'gvpb_code',
		'note',
		'source',
		'status',
		'registered_at',
		'updated_at',
	];

	protected $casts = [
		'registered_at' => 'datetime',
		'updated_at' => 'datetime',
	];
}
