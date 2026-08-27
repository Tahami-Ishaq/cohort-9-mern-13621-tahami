// @ts-check

/**
 * @template T
 * @param {PromiseLike<T>} operation
 * @param {string} context
 * @returns {Promise<T>}
 */
export const withTestContext = async (operation, context) => {
    try {
        return await operation;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`${context}: ${message}`, { cause: error });
    }
};