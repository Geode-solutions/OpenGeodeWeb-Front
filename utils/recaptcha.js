function check_recaptcha_params(name, email, launch) {
  if (name !== "") return { statusCode: 500 }
  if (email !== "") return { statusCode: 500 }
  if (launch !== false) return { statusCode: 500 }
  return { statusCode: 200 }
}
