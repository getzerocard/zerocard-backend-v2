# Explanation of Each Model

This README provides a detailed explanation of each model defined in the Prisma schema for a comprehensive, double-entry ledger system. Use these descriptions to understand the purpose, key fields, and rationale behind each table.

---

## User

**Purpose**  
Represents end users or system actors.

**Key Fields**

- `id` (String, UUID): Primary key.
- `email` (String, unique): User’s email address.
- `name` (String, optional): Full name or display name.
- `createdAt` (DateTime): Timestamp when the record was created (`@default(now())`).
- `updatedAt` (DateTime): Timestamp automatically updated on every row modification (`@updatedAt`).

**Relationships**

- **accounts** (`Account[]`): One-to-many relationship to the `Account` model. A single user can own multiple ledger accounts.

**Notes**

- If your system does not require user-specific accounts, you can omit or adapt this model.
- Use `email` (or another unique field) to enforce user identity and prevent duplicates.

---

## Currency

**Purpose**  
Central registry of all currencies (fiat or crypto) supported by the system.

**Key Fields**

- `id` (String, UUID): Primary key.
- `code` (String, unique): ISO-style code, e.g., `“NGN”`, `“USD”`, `“BTC”`.
- `name` (String): Full name of the currency, e.g., `“Nigerian Naira”`, `“US Dollar”`.
- `decimalPlaces` (Int): Number of decimal places used by the currency (e.g., `2` for NGN, `8` for BTC).
- `createdAt` (DateTime): Timestamp when the record was created (`@default(now())`).
- `updatedAt` (DateTime): Timestamp automatically updated on modification (`@updatedAt`).

**Relationships**

- **accounts** (`Account[]`): One-to-many relationship to the `Account` model. Each account must reference a valid currency.

**Rationale**

- Ensures each `Account` is tied to a single, well-defined currency.
- Simplifies multi-currency logic––you can join on `Currency` to get display names, codes, or decimal precision when formatting amounts.

---

## Account

**Purpose**  
Represents any “ledger account” that holds balances in exactly one currency. Examples include:

- A user’s Naira wallet.
- A system-level “Fee Collection” account.
- The “Bank Float” for off-chain fiat operations.

**Key Fields**

- `id` (String, UUID): Primary key.
- `accountNumber` (String, unique): A human-readable, unique identifier (e.g., `“User123_NGN_Wallet”` or `“SYSTEM_FEE_ACCOUNT”`).
- `name` (String): Descriptive name, such as `“User 123 Naira Wallet”`.
- `currencyId` (String): Foreign key referencing `Currency.id`.
- `ownerId` (String, optional): Foreign key referencing `User.id`. Use this to tie an account to a specific user (if applicable).
- `cachedBalance` (Decimal, default 0.0): Cached balance for fast lookups. Keep in sync with the sum of all related `TransactionEntry` rows.
- `createdAt` (DateTime): Timestamp when the account was created (`@default(now())`).
- `updatedAt` (DateTime): Timestamp automatically updated on modification (`@updatedAt`).

**Relationships**

- **currency** (`Currency`): The currency to which this account belongs.
- **owner** (`User?`): The optional user who owns this account.
- **entries** (`TransactionEntry[]`): All debit/credit entries affecting this account.

**Indexes**

- `@@index([accountNumber])`
- `@@index([ownerId])`

**Notes**

- **Balance Integrity**: Although `cachedBalance` improves read performance, periodically run a reconciliation job to compare `cachedBalance` against `SUM(CREDIT) – SUM(DEBIT)` of `TransactionEntry` rows.
- **Account Number**: You can generate this as a UUID or follow a structured format (e.g., `USERID_CURR_XXXX`).

---

## Transaction

**Purpose**  
Serves as the “header” for a financial event (journal entry). Each `Transaction` groups one or more `TransactionEntry` lines (debits and credits) that must balance.

**Key Fields**

- `id` (String, UUID): Primary key.
- `reference` (String, unique): A unique, human-readable code (e.g., `“TXN-20250601-0001”`).
- `category` (`TransactionCategory` enum): Type of transaction (e.g., `DEPOSIT`, `WITHDRAWAL`, `TRANSFER`, `FEE`, `REFUND`, `ADJUSTMENT`). Defaults to `TRANSFER`.
- `status` (`TransactionStatus` enum): Current state: `PENDING`, `COMPLETED`, or `FAILED`. Defaults to `PENDING`.
- `description` (String, optional): Optional free-text description for operators or auditors.
- `initiatedById` (String, optional): Foreign key referencing `User.id`. The user who triggered or initiated this transaction (if applicable).
- `createdAt` (DateTime): Timestamp when the transaction record was created (`@default(now())`).
- `completedAt` (DateTime, optional): Timestamp when the transaction was finalized (set when status becomes `COMPLETED`).

**Relationships**

- **initiatedBy** (`User?`): The optional user who initiated the transaction.
- **entries** (`TransactionEntry[]`): All debit and credit lines for this transaction.

**Indexes**

- `@@index([reference])`
- `@@index([status])`

**Notes**

- **Balancing Rule**: Enforce at the application or database level that for each `Transaction`, `SUM(amount WHERE entryType = DEBIT) == SUM(amount WHERE entryType = CREDIT)`. If not balanced, reject or keep the transaction in `PENDING`.
- **Status Transitions**:
  1. Create `Transaction` with `PENDING`.
  2. Insert all associated `TransactionEntry` rows.
  3. Verify balance (debits match credits).
  4. Update `cachedBalance` on each related `Account`.
  5. Set `status = COMPLETED` and `completedAt = now()`.
  6. If any error occurs, set `status = FAILED` and add an `AuditLog` entry or reversal.

---

## TransactionEntry

**Purpose**  
Represents the individual debit or credit lines that belong to a single `Transaction`. Every entry must reference an `Account` and specify whether it is a debit or credit.

**Key Fields**

- `id` (String, UUID): Primary key.
- `transactionId` (String): Foreign key referencing `Transaction.id`.
- `accountId` (String): Foreign key referencing `Account.id`.
- `entryType` (`EntryType` enum): Either `DEBIT` or `CREDIT`.
- `amount` (Decimal): A positive value. The sign (debit vs. credit) is determined by `entryType`.
- `memo` (String, optional): Optional note explaining this line (e.g., “Transfer to Savings,” “Withdrawal Fee”).
- `createdAt` (DateTime): Timestamp when the entry was created (`@default(now())`).

**Relationships**

- **transaction** (`Transaction`): The parent transaction header.
- **account** (`Account`): The ledger account affected by this entry.

**Indexes**

- `@@index([transactionId])`
- `@@index([accountId])`

**Notes**

- **Positive Amounts Only**: Always store `amount` as a positive number. Use `entryType` to denote whether you are debiting or crediting an account.
- **Balancing**: For any `Transaction`, the sum of all `amount` values where `entryType = DEBIT` must equal the sum where `entryType = CREDIT`.
- **Reversals**: Instead of deleting or editing existing entries, create a new “reversal” `Transaction` with opposite `DEBIT`/`CREDIT` lines to correct mistakes.

---

## AuditLog

**Purpose**  
Keeps an immutable trail of inserts, updates, and deletes on critical tables (`Account`, `Transaction`, `TransactionEntry`). Use it for forensic auditing and to detect unauthorized changes.

**Key Fields**

- `id` (String, UUID): Primary key.
- `tableName` (String): The name of the table affected (e.g., `“Account”`, `“Transaction”`, `“TransactionEntry”`).
- `recordId` (String): The primary key value of the record affected.
- `action` (String): The type of operation: `“CREATE”`, `“UPDATE”`, or `“DELETE”`.
- `oldValue` (Json, optional): Snapshot of the record before the change (for `UPDATE` or `DELETE`).
- `newValue` (Json, optional): Snapshot of the record after the change (for `CREATE` or `UPDATE`).
- `performedBy` (String, optional): Identifier of the user or system that performed the operation (e.g., `userId` or `“SYSTEM”`).
- `performedAt` (DateTime): Timestamp when the action occurred (`@default(now())`).

**Indexes**

- `@@index([tableName])`
- `@@index([recordId])`
- `@@index([performedBy])`

**Notes**

- **Populating Audit Logs**:
  - **Application Logic**: Wrap each Prisma `create`, `update`, or `delete` call in a transaction that first captures `oldValue` (if any), then inserts an `AuditLog` entry with both old and new snapshots.
  - **Database Triggers**: For stricter immutability, implement PostgreSQL triggers on each table to automatically INSERT into `AuditLog` on `INSERT`, `UPDATE`, or `DELETE`. The trigger can access `OLD` and `NEW` values directly.
- **Read-Only**: Never modify or delete `AuditLog` rows. They exist as a permanent record of historical changes.

---

## Putting It All Together

1. **Double-Entry Ledger**

   - By grouping multiple `TransactionEntry` rows under a single `Transaction`, you implement double‐entry bookkeeping. Every journal entry must balance before marking the transaction as `COMPLETED`.

2. **Currency Integrity**

   - Each `Account` is strictly tied to one `Currency`. You cannot mix NGN entries with USD entries in the same account.

3. **Transaction Lifecycle**

   1. Create `Transaction` (status = `PENDING`).
   2. Insert balanced `TransactionEntry` rows (equal total debits and credits).
   3. Update `cachedBalance` on each referenced `Account`.
   4. Set `status = COMPLETED` and populate `completedAt`.
   5. If any step fails, set `status = FAILED` and log details for investigation.

4. **Audit and Reconciliation**
   - `AuditLog` ensures a full, immutable trail of all modifications.
   - Periodic reconciliation scripts compare `Account.cachedBalance` against the sum of related debits/credits to catch any discrepancies.

Use these explanations as a reference when extending or maintaining the Prisma schema. You can add additional models (e.g., `Approval`, `FxRate`, `Merchant`) following the same conventions to fit your specific business requirements. Keeping each model’s purpose and fields well-documented in this README will ensure long-term stability and clarity in your codebase.
