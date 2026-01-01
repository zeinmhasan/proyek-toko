import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newPassword = "Admin123!";
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const user = await prisma.user.update({
    where: { email: "admin@tokoku.com" },
    data: { password: hashedPassword },
  });

  console.log("Password reset successful for:", user.email);
  console.log("New password:", newPassword);

  await prisma.$disconnect();
}

main();
