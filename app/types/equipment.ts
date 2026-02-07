/**
 * Represents a club equipment item (jersey, shorts, accessories, etc.)
 */
export interface Equipment {
    /** Unique identifier for the equipment. */
    id: string;
    /** Name of the equipment item. */
    name: string;
    /** Category/type (e.g., 'Maillot', 'Short', 'Chaussettes', 'Accessoire'). */
    category: string;
    /** Description of the item. */
    description: string;
    /** Price in EUR. */
    price: number;
    /** Available sizes (e.g., ['XS', 'S', 'M', 'L', 'XL', 'XXL']). */
    sizes: string[];
    /** Stock quantity per size. */
    stock: Record<string, number>;
    /** URL to the main product image. */
    imageUrl: string;
    /** Additional image URLs for gallery. */
    gallery?: string[];
    /** Whether the item is currently available for order. */
    isAvailable: boolean;
    /** Order number for display sorting. */
    order?: number;
    /** GOBIK product reference (English name). */
    gobikReference?: string;
    /** Internal product code for ordering. */
    productCode?: string;
    /** Created timestamp. */
    createdAt?: string;
    /** Updated timestamp. */
    updatedAt?: string;
}

/**
 * Represents an equipment order from a member.
 */
export interface EquipmentOrder {
    /** Unique identifier for the order. */
    id: string;
    /** Member name. */
    memberName: string;
    /** Member email. */
    memberEmail: string;
    /** Items ordered with size and quantity. */
    items: {
        equipmentId: string;
        equipmentName: string;
        size: string;
        quantity: number;
        unitPrice: number;
    }[];
    /** Total price of the order. */
    totalPrice: number;
    /** Order status. */
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    /** Order notes. */
    notes?: string;
    /** Created timestamp. */
    createdAt: string;
}
