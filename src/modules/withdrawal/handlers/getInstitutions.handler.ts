import fetch from 'node-fetch';

/**
 * Fetches all banks for a given fiat code from a specified base URL.
 * @param fiatCode The fiat currency code (e.g., 'USD', 'NGN').
 * @param baseUrl The base URL for the institutions API (e.g., 'https://api.paycrest.io/v1).
 * @returns Promise resolving to an array of banks.
 * @throws Error if arguments are invalid or the request fails.
 */
export async function fetchInstitutionsByFiatCode(fiatCode: string, baseUrl: string): Promise<any[]> {
    if (!fiatCode || typeof fiatCode !== 'string') {
        throw new Error('Missing or invalid fiatCode parameter');
    }
    if (!baseUrl || typeof baseUrl !== 'string') {
        throw new Error('Missing or invalid baseUrl parameter');
    }
    const apiUrl = `${baseUrl.replace(/\/$/, '')}/institutions/${fiatCode.toLowerCase()}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch institutions: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data || !Array.isArray(data.data)) {
        throw new Error('Malformed response from institutions API');
    }
    return data.data
        .filter((inst: any) => inst.type === 'bank')
        .map((inst: any) => ({ name: inst.name, code: inst.code, type: inst.type }));
}
