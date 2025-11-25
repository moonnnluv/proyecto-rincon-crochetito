export function validateUser(values, { isEdit = false } = {}) {
  const errors = {};
  const req = (k, msg = "Obligatorio") => { if (!values[k]?.toString().trim()) errors[k] = msg; };

  req("nombre");
  req("email");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (values.email && !emailRe.test(values.email)) errors.email = "Email inválido";

  if (!isEdit) req("password");
  if (values.password && values.password.length < 6) errors.password = "Mínimo 6 caracteres";

  if (!["ADMIN","VENDEDOR","CLIENTE"].includes(values.rol || "")) errors.rol = "Rol inválido";
  return errors;
}
