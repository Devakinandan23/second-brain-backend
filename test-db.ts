import { PrismaClient } from './generated/prisma/client.js'
// @ts-ignore
const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { notes: true } } }
  })
  console.log(users.map((u: any) => ({ username: u.username, notesCount: u._count.notes })))
}
main().finally(() => prisma.$disconnect())
