function check_recaptcha_params(name, email, launch) {
  if (name !== "") {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "INTERNAL_ERROR" }),
    }
  }
  if (email !== "") {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "INTERNAL_ERROR" }),
    }
  }
  if (launch !== false) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "INTERNAL_ERROR" }),
    }
  }
  return { statusCode: 200, body: JSON.stringify({ message: "OK" }) }
}

export { check_recaptcha_params }
