<?php

namespace App\Models\Global;

use Illuminate\Database\Eloquent\Model;


/**
 * Posts model
 *
 * Relaciones:
 * - user(): Usuario autor del post (belongsTo User)
 * - details(): Detalles de colaborador (hasMany PostDetails)
 */
class Posts extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'text',
        'user_id',
    ];

    /**
     * Usuario autor del post
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    /**
     * Detalles de colaborador (colaboradores asociados a este post)
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function details()
    {
        return $this->hasMany(PostDetails::class, 'post_id');
    }
}
