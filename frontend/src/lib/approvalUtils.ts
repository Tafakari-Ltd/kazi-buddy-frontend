/**
 * Check if an error indicates that the user needs admin approval
 */
export const isApprovalNeededError = (error: any): boolean => {
    if (!error) return false;

    const errorMessage = typeof error === 'string' ? error : error?.message || '';
   
    // Check for common phrases that indicate approval is needed
    const approvalPhrases = [
        'not approved',
        'awaiting approval',
        'pending approval',
        'not activated',
        'not verified by admin',
        'approval required',
    ];

    return approvalPhrases.some((phrase) =>
        errorMessage.toLowerCase().includes(phrase)
    );
};

/**
 * Extract user ID from error response if available
 */
export const extractUserIdFromError = (error: any): string | null => {
    if (!error) return null;

    return error?.userId || error?.user_id || null;
};

/**
 * Check if a user registration is pending admin approval
 * Used after signup to prompt admin approval flow
 */
export const checkUserApprovalStatus = async (userId: string, email: string) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/adminpanel/users/${userId}/status/`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.ok) {
            const data = await response.json();
            return {
                isApproved: data.is_verified || data.is_approved,
                status: data.status,
            };
        }

        return {
            isApproved: false,
            status: 'pending',
        };
    } catch (error) {
        console.error('Error checking approval status:', error);
        return {
            isApproved: false,
            status: 'unknown',
        };
    }
};