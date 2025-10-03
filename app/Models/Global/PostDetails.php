<?php

namespace App\Models\Global;

use Illuminate\Database\Eloquent\Model;


/**
 * PostDetails model
 *
 * Relaciones:
 * - post(): Post asociado (belongsTo Posts)
 * - colaborator(): Usuario colaborador (belongsTo User)
 */
class PostDetails extends Model
{
    protected $fillable = [
        'post_id',
        'colaborator_id',
    ];

    /**
     * Post asociado
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function post()
    {
        return $this->belongsTo(Posts::class, 'post_id');
    }

    /**
     * Usuario colaborador
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function colaborator()
    {
        return $this->belongsTo(\App\Models\User::class, 'colaborator_id');
    }
}
