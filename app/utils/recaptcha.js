function check_recaptcha_params(
  recaptcha_name,
  recaptcha_email,
  recaptcha_launch,
) {
  console.log("check_recaptcha_params", {
    name: recaptcha_name,
    email: recaptcha_email,
    launch: recaptcha_launch,
  })
  if (recaptcha_name !== "") {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "INTERNAL_ERROR" }),
    }
  }
  if (recaptcha_email !== "") {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "INTERNAL_ERROR" }),
    }
  }
  if (recaptcha_launch !== false) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "INTERNAL_ERROR" }),
    }
  }
  return { statusCode: 200, body: JSON.stringify({ message: "OK" }) }
}

export { check_recaptcha_params }
