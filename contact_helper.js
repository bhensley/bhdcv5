exports.valid_contact_form = function (sub, con) {
  if (sub.length < 3 || sub.length > 30) {
    return false;
  }

  if (con.length < 10) {
    return false;
  }

  return true;
}