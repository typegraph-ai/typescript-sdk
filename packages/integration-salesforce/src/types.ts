/**
 * Raw Salesforce REST API response types.
 * These represent what the Salesforce API actually returns before normalization.
 * Salesforce uses SOQL (Salesforce Object Query Language) for data queries.
 */

// ── SOQL Query Response ──

export interface SalesforceQueryResponse<T> {
  totalSize: number
  done: boolean
  nextRecordsUrl?: string | undefined
  records: T[]
}

// ── Contacts ──

export interface SalesforceRawContact {
  attributes: { type: 'Contact'; url: string }
  Id: string
  FirstName?: string | undefined
  LastName: string
  Email?: string | undefined
  Phone?: string | undefined
  MobilePhone?: string | undefined
  AccountId?: string | undefined
  Title?: string | undefined
  Department?: string | undefined
  MailingStreet?: string | undefined
  MailingCity?: string | undefined
  MailingState?: string | undefined
  MailingPostalCode?: string | undefined
  MailingCountry?: string | undefined
  OwnerId?: string | undefined
  CreatedDate: string
  LastModifiedDate: string
  IsDeleted: boolean
}

// ── Accounts ──

export interface SalesforceRawAccount {
  attributes: { type: 'Account'; url: string }
  Id: string
  Name: string
  Type?: string | undefined
  Industry?: string | undefined
  Website?: string | undefined
  Phone?: string | undefined
  BillingStreet?: string | undefined
  BillingCity?: string | undefined
  BillingState?: string | undefined
  BillingPostalCode?: string | undefined
  BillingCountry?: string | undefined
  NumberOfEmployees?: number | undefined
  AnnualRevenue?: number | undefined
  OwnerId?: string | undefined
  Description?: string | undefined
  CreatedDate: string
  LastModifiedDate: string
  IsDeleted: boolean
}

// ── Opportunities ──

export interface SalesforceRawOpportunity {
  attributes: { type: 'Opportunity'; url: string }
  Id: string
  Name: string
  Amount?: number | undefined
  StageName: string
  Probability?: number | undefined
  CloseDate?: string | undefined
  Type?: string | undefined
  AccountId?: string | undefined
  OwnerId?: string | undefined
  Description?: string | undefined
  NextStep?: string | undefined
  LeadSource?: string | undefined
  ForecastCategory?: string | undefined
  IsClosed: boolean
  IsWon: boolean
  CreatedDate: string
  LastModifiedDate: string
  IsDeleted: boolean
}

// ── Leads ──

export interface SalesforceRawLead {
  attributes: { type: 'Lead'; url: string }
  Id: string
  FirstName?: string | undefined
  LastName: string
  Email?: string | undefined
  Company?: string | undefined
  Title?: string | undefined
  Status: string
  Phone?: string | undefined
  MobilePhone?: string | undefined
  Industry?: string | undefined
  LeadSource?: string | undefined
  Rating?: string | undefined
  NumberOfEmployees?: number | undefined
  AnnualRevenue?: number | undefined
  OwnerId?: string | undefined
  IsConverted: boolean
  ConvertedAccountId?: string | undefined
  ConvertedContactId?: string | undefined
  ConvertedOpportunityId?: string | undefined
  CreatedDate: string
  LastModifiedDate: string
  IsDeleted: boolean
}

// ── Generic ──

export interface SalesforceApiError {
  message: string
  errorCode: string
  fields?: string[] | undefined
}

export interface SalesforceApiErrorResponse {
  errors: SalesforceApiError[]
}
