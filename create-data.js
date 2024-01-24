import fs from "fs";
import { faker } from "@faker-js/faker";

const destinationFilePath = "./data/import.csv";
const writeStream = fs.createWriteStream(destinationFilePath);

writeStream.write("name;email;age;salary;isActive\n");

for (let index = 0; index < 1000; index++) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  const email = faker.internet.email({ firstName, lastName });
  const age = faker.number.int({ min: 10, max: 100 });
  const salary = faker.string.numeric(4, { allowLeadingZeros: true });
  const active = faker.datatype.boolean();

  const randomPerson = [fullName, email, age, salary, active];
  // console.log({ randomPerson });
  writeStream.write(randomPerson.join(";") + "\n");
}
