import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "admin@tokoku.com" },
  });

  if (user) {
    console.log("User found:");
    console.log("  ID:", user.id);
    console.log("  Email:", user.email);
    console.log("  Name:", user.name);
    console.log("  Password hash:", user.password.substring(0, 20) + "...");
  } else {
    console.log("User NOT FOUND!");
  }

  await prisma.$disconnect();
}

main();
