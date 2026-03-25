/**
 * Raw HubSpot CRM v3 API response types.
 * These represent what the HubSpot API actually returns before normalization.
 */

// -- Contacts --

export interface HubSpotContactsListResponse {
  results: HubSpotRawContact[]
  paging?: {
    next?: {
      after: string
      link: string
    } | undefined
  } | undefined
}

export interface HubSpotRawContact {
  id: string
  properties: {
    email?: string | undefined
    firstname?: string | undefined
    lastname?: string | undefined
    phone?: string | undefined
    company?: string | undefined
    lifecyclestage?: string | undefined
    createdate?: string | undefined
    lastmodifieddate?: string | undefined
    hs_object_id?: string | undefined
  }
  createdAt: string
  updatedAt: string
  archived: boolean
}

// -- Companies --

export interface HubSpotCompaniesListResponse {
  results: HubSpotRawCompany[]
  paging?: {
    next?: {
      after: string
      link: string
    } | undefined
  } | undefined
}

export interface HubSpotRawCompany {
  id: string
  properties: {
    name?: string | undefined
    domain?: string | undefined
    industry?: string | undefined
    type?: string | undefined
    city?: string | undefined
    state?: string | undefined
    country?: string | undefined
    createdate?: string | undefined
    lastmodifieddate?: string | undefined
    hs_object_id?: string | undefined
  }
  createdAt: string
  updatedAt: string
  archived: boolean
}

// -- Deals --

export interface HubSpotDealsListResponse {
  results: HubSpotRawDeal[]
  paging?: {
    next?: {
      after: string
      link: string
    } | undefined
  } | undefined
}

export interface HubSpotRawDeal {
  id: string
  properties: {
    dealname?: string | undefined
    amount?: string | undefined
    dealstage?: string | undefined
    pipeline?: string | undefined
    closedate?: string | undefined
    hubspot_owner_id?: string | undefined
    createdate?: string | undefined
    lastmodifieddate?: string | undefined
    hs_object_id?: string | undefined
  }
  createdAt: string
  updatedAt: string
  archived: boolean
}

// -- Generic --

export interface HubSpotApiError {
  status: string
  message: string
  correlationId: string
  category: string
}
