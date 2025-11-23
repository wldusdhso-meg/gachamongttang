package com.meg.gachamongddang.server.domain.product

enum class ProductCategory(val displayName: String) {
    ACCESSORY("액세서리"),
    STATIONERY("문구"),
    ETC("기타");
    
    companion object {
        fun fromString(value: String): ProductCategory? {
            return values().find { it.name.equals(value, ignoreCase = true) }
        }
    }
}

