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
    /** Fit/cut of the item (e.g. 'Regular fit', 'Slim fit', 'Standard'). */
    cut?: string;
    /** Created timestamp. */
    createdAt?: string;
    /** Updated timestamp. */
    updatedAt?: string;
}

/** 'stock' = taken from club stock (reserved at order time); 'campaign' = group order. */
export type EquipmentOrderSource = 'stock' | 'campaign';

/**
 * Represents an equipment order from a member.
 * Orders placed before the jersey payments feature (docs/maillots.md) lack memberId,
 * source, paymentReference and the payment/delivery dates.
 */
export interface EquipmentOrder {
    /** Unique identifier for the order. */
    id: string;
    /** Member name. */
    memberName: string;
    /** Member email. */
    memberEmail: string;
    /** Member phone (optional). */
    memberPhone?: string;
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
    /** Order status. 'confirmed' only exists on legacy orders. */
    status: 'pending' | 'paid' | 'confirmed' | 'delivered' | 'cancelled';
    /** Order notes. */
    notes?: string;
    /** Created timestamp. */
    createdAt: string;
    /** Last update timestamp. */
    updatedAt?: string;
    /** Ordering member, taken from the session. */
    memberId?: string;
    source?: EquipmentOrderSource;
    /** Group-order campaign, when source is 'campaign'. */
    campaignId?: string;
    /** Belgian structured communication (OGM): 12 digits, unformatted. */
    paymentReference?: string;
    /** Payment date, YYYY-MM-DD: bank value date, or the day of a manual mark. */
    paidAt?: string;
    /** Bank transaction that paid the order. */
    bankTransactionId?: string;
    /** Hand-over timestamp (ISO). */
    deliveredAt?: string;
    /** Cancellation timestamp (ISO). */
    cancelledAt?: string;
}

export type EquipmentOrderStatus = EquipmentOrder['status'];

export type CampaignStatus = 'open' | 'closed' | 'ordered' | 'received';

/** A group order placed with the supplier (Gobik). */
export interface EquipmentCampaign {
    id: string;
    title: string;
    equipmentIds: string[];
    /** Member orders are refused after this instant (ISO). */
    closesAt: string;
    status: CampaignStatus;
    /** Set when the campaign moves to 'ordered' (ISO). */
    supplierOrderedAt?: string;
    /** Set when the campaign moves to 'received' (ISO). */
    receivedAt?: string;
    /** Extra units for club stock: equipmentId → size → quantity. Added to stock on 'received'. */
    extraStock?: Record<string, Record<string, number>>;
    createdAt: string;
    updatedAt?: string;
}

export type BankTransactionStatus = 'matched' | 'unmatched' | 'ignored';
export type BankTransactionReason =
    | 'no-reference'
    | 'unknown-reference'
    | 'not-pending'
    | 'amount-mismatch';

/** A credit imported from a CODA statement. The full counterparty IBAN is never stored. */
export interface BankTransaction {
    /** First 20 hex of sha256(bankRef|valueDate|amountCents|counterpartyAccount). */
    id: string;
    importedAt: string;
    /** YYYY-MM-DD */
    valueDate: string;
    amountCents: number;
    counterpartyName: string;
    counterpartyIbanLast4: string;
    /** At most 140 characters. */
    communication: string;
    /** 12-digit OGM found in the credit. */
    reference?: string;
    status: BankTransactionStatus;
    /** Why an unmatched credit was not matched. */
    reason?: BankTransactionReason;
    orderId?: string;
    /** Assigned by an admin rather than by the automatic match. */
    manual?: boolean;
}

/** Club bank account shown on the payment card and encoded in the EPC QR. */
export interface PaymentSettings {
    beneficiary: string;
    /** Upper case, no spaces. */
    iban: string;
    bic?: string;
    updatedAt?: string;
}
