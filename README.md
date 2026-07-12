# project 64D- Keokradong(Online Marketplace)
A district-based digital marketplace platform connecting local producers, sellers, verification agents, and consumers across Bangladesh's 64 districts.

Project-64D creates a trusted marketplace ecosystem where local products can be discovered, verified, and sold through a structured district-level network.

---

## 🚀 Features

### 👤 Role-Based Authentication

The platform supports multiple user roles:

| Role | Description |
|------|-------------|
| Consumer | Browse and purchase products |
| Seller | Upload and manage products |
| Agent | Verify products physically |
| Admin | Approve users and manage platform |
| Super Admin | Full system control |

---
## 🏪 Seller Workflow

Seller registration process:


Register
↓
Account status: Pending
↓
Admin approval
↓
Seller becomes active
↓
Can upload products

## 🔍 Product Verification System

Every product follows a verification pipeline:


Seller uploads product
|
↓
Product status: Pending
|
↓
District agent inspection
|
↓
Verified / Rejected

# 🏪 Agents can:

- View pending products
- Inspect products
- Submit verification reports
- Give quality scores
- Approve or reject products

---

# 🗺️ District Marketplace Model

Products are connected with:

- Seller district
- Verification agent district
- Local supply networks

This enables:

- Regional product discovery
- Authenticity verification
- Decentralized marketplace management

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Backend

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)

---
# 🔐 Security

The application uses Supabase Row Level Security.

Examples:

- Users can access their own profiles
- Only active agents can verify products
- Sellers manage their own products
- Admins approve seller and agent accounts
