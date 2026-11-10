export const validate = (schema) => (req,_res,next) => {
  const parsed=schema.safeParse(req.body);
  if(!parsed.success) return next(Object.assign(new Error('Request validation failed.'),{code:'VALIDATION',status:400,details:parsed.error.flatten()}));
  req.body=parsed.data; next();
};

