export {
  authenticate,
  authorize,
  requireAdmin,
  optionalAuth,
} from "./auth.middleware.js";
export { errorHandler, notFoundHandler } from "./error.middleware.js";
export {
  validate,
  paginationSchema,
  idParamSchema,
  searchSchema,
} from "./validate.middleware.js";
