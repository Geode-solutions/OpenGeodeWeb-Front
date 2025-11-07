function check_recaptcha_params(name, email, launch) {
  if (name !== "") {
    return { status: 500 }
  }
  if (email !== "") {
    return { status: 500 }
  }
  if (launch !== false) {
    return { status: 500 }
  }
  return { status: 200 }
}

export { check_recaptcha_params }
