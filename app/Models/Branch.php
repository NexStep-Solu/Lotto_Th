<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'location_id',
    ];
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id', 'id');
    }
    public function cashBalance()
    {
        return $this->cashLedgers()
            ->selectRaw("
            COALESCE(SUM(
                CASE 
                    WHEN type = 'inflow' THEN amount 
                    ELSE -amount 
                END
            ), 0) as balance
        ")
            ->value('balance');
    }
}
