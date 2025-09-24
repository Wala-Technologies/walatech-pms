# WalaTech - Data Flow Diagrams

This document contains visual representations of key data flows in the WalaTech system. These diagrams use Mermaid.js syntax and can be rendered in any Markdown viewer that supports Mermaid.

## 1. Order to Cash Process

```mermaid
flowchart TD
    A[Lead] --> B[Opportunity]
    B --> C[Quotation]
    C -->|Customer Approves| D[Sales Order]
    D --> E[Delivery Note]
    E --> F[Sales Invoice]
    F --> G[Payment Entry]
    
    subgraph "Order to Cash Process"
        A --> B --> C --> D --> E --> F --> G
    end
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#9f9,stroke:#333,stroke-width:2px
```

## 2. Procure to Pay Process

```mermaid
flowchart TD
    A[Material Request] --> B[Request for Quotation]
    B --> C[Supplier Quotation]
    C --> D[Purchase Order]
    D --> E[Purchase Receipt]
    E --> F[Purchase Invoice]
    F --> G[Payment Entry]
    
    subgraph "Procure to Pay Process"
        A --> B --> C --> D --> E --> F --> G
    end
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#9f9,stroke:#333,stroke-width:2px
```

## 3. Manufacturing Process

```mermaid
flowchart TD
    A[Item] -->|Has BOM| B[Work Order]
    B --> C[Stock Entry - Material Transfer]
    C --> D[Job Card]
    D --> E[Stock Entry - Manufacture]
    E --> F[Finished Goods]
    
    subgraph "Manufacturing Process"
        A --> B --> C --> D --> E --> F
    end
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#9f9,stroke:#333,stroke-width:2px
```

## 4. Project Management Flow

```mermaid
flowchart TD
    A[Project] --> B[Tasks]
    B --> C[Timesheet Entries]
    C --> D[Expense Claims]
    D --> E[Sales Invoice]
    
    subgraph "Project Management Flow"
        A --> B --> C --> D --> E
    end
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#9f9,stroke:#333,stroke-width:2px
```

## 5. HR & Payroll Process

```mermaid
flowchart TD
    A[Employee] --> B[Attendance]
    A --> C[Leave Application]
    A --> D[Expense Claim]
    B & C & D --> E[Salary Slip]
    E --> F[Journal Entry]
    F --> G[Payment Entry]
    
    subgraph "HR & Payroll Process"
        A --> B & C & D --> E --> F --> G
    end
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#9f9,stroke:#333,stroke-width:2px
```

## 6. Quality Management Flow

```mermaid
flowchart TD
    A[Quality Inspection] -->|Pass| B[Next Process]
    A -->|Fail| C[Quality Action]
    C --> D[Root Cause Analysis]
    D --> E[Corrective Action]
    E --> F[Preventive Action]
    
    subgraph "Quality Management Flow"
        A --> B
        A --> C --> D --> E --> F
    end
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#9f9,stroke:#333,stroke-width:2px
    style F fill:#9f9,stroke:#333,stroke-width:2px
```

## 7. Integrated Business Flow

```mermaid
flowchart LR
    A[CRM] -->|Leads/Opportunities| B[Selling]
    B -->|Sales Orders| C[Inventory]
    C -->|Stock Levels| D[Buying]
    D -->|Purchase Orders| E[Manufacturing]
    E -->|Finished Goods| C
    C -->|Deliveries| F[Accounts Receivable]
    D -->|Receipts| G[Accounts Payable]
    H[Projects] <-->|Time & Expenses| I[HR & Payroll]
    J[Quality] <-->|Inspections| E & C
    
    subgraph "WalaTech Modules"
        A
        B
        C
        D
        E
        F
        G
        H
        I
        J
    end
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#9f9,stroke:#333,stroke-width:2px
    style G fill:#f96,stroke:#333,stroke-width:2px
```

## Usage Notes

1. These diagrams use Mermaid.js syntax
2. To view them, use a Markdown viewer that supports Mermaid
3. In VS Code, install the "Mermaid Preview" or similar extension
4. On GitHub/GitLab, the diagrams will render automatically
5. You can copy the Mermaid code to online editors like [Mermaid Live Editor](https://mermaid.live/)

## Customization

You can modify these diagrams by:
1. Changing the node text
2. Adjusting the flow direction (TD for top-down, LR for left-right)
3. Adding or removing nodes and connections
4. Customizing styles with the `style` blocks
