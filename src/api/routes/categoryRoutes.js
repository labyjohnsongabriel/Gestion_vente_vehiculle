// Si vous faites : app.use('/api/categories', categoryRoutes)
// alors dans categoryRoutes.js, utilisez :
router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);
// etc.
