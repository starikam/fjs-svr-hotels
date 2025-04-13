conn = new Mongo();
db = conn.getDB('booking');

db.users.insert({
  email: 'admin@mail.ru',
  passwordHash: '$2b$10$gZDjbdOxxlseV2iih3S/Bue9mrkSWEjQIF/IY/Z.Hgg1Erki1lfxi',
  name: 'Admin',
  contactPhone: '+11111111111111',
  role: 'admin',
});

db.users.insert({
  email: 'manager@mail.ru',
  passwordHash: '$2b$10$92Y8Oe8fKdmtH93Dfk9/nuYAFSoqcmPI1yFQ/uvHTR8x5hseNXcvK',
  name: 'Manager',
  contactPhone: '+11111111111111',
  role: 'manager',
});

db.users.insert({
  email: 'client@mail.ru',
  passwordHash: '$2b$10$PBe97TUuCnCUVJn4hvgDUubiLQc4Jet.FUBihEdcrVwEeozlKwNHS',
  name: 'Client',
  contactPhone: '+11111111111111',
  role: 'client',
});