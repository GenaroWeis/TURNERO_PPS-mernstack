const fieldError = (param, msg) => ({
  status: "error",
  errors: [{ param, msg }]
});
//formato de express validator