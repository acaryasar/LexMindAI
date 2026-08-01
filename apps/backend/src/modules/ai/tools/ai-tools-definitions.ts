export interface AITool {
  name: string;
  description: string;
  parameters: any;
  handler: (params: any, userId: string, prisma: any) => Promise<any>;
}

export const AI_TOOLS: AITool[] = [
  {
    name: 'get_lawyer_stats',
    description: 'Avukatın istatistiklerini getir (müvekkil sayısı, dava sayısı vb.)',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async (params: any, userId: string, prisma: any) => {
      const clientCount = await prisma.clientLawyer.count({
        where: { userId },
      });
      const caseCount = await prisma.caseLawyer.count({
        where: { userId },
      });
      const activeCaseCount = await prisma.case.count({
        where: {
          lawyers: {
            some: {
              userId,
            },
          },
          status: 'ACTIVE',
        },
      });

      return {
        clientCount,
        caseCount,
        activeCaseCount,
      };
    },
  },
  {
    name: 'get_client_count',
    description: 'Avukatın toplam müvekkil sayısını getir',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async (params: any, userId: string, prisma: any) => {
      const count = await prisma.clientLawyer.count({
        where: { userId },
      });
      return { count };
    },
  },
  {
    name: 'get_lawyer_client_count_by_name',
    description: 'İsim bazlı avukat ara ve müvekkil sayısını getir',
    parameters: {
      type: 'object',
      properties: {
        lawyerName: {
          type: 'string',
          description: 'Avukatın adı (örn: "Yaşar Acar")',
        },
      },
      required: ['lawyerName'],
    },
    handler: async (params: any, userId: string, prisma: any) => {
      const lawyerName = params.lawyerName.toLowerCase();
      
      // Kullanıcıyı ad ve soyadına göre ara
      const users = await prisma.user.findMany({
        where: {
          OR: [
            {
              firstName: {
                contains: lawyerName.split(' ')[0],
                mode: 'insensitive',
              },
              lastName: {
                contains: lawyerName.split(' ')[1] || '',
                mode: 'insensitive',
              },
            },
            {
              firstName: {
                contains: lawyerName,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: lawyerName,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (users.length === 0) {
        return {
          found: false,
          message: `${params.lawyerName} adında bir kullanıcı bulunamadı`,
        };
      }

      // Avukat rolüne sahip kullanıcıyı bul
      const lawyer = users.find((u: any) => 
        u.roles.some((r: any) => r.role.name === 'LAWYER' || r.role.name === 'ASSOCIATE')
      );

      if (!lawyer) {
        return {
          found: true,
          isLawyer: false,
          message: `${params.lawyerName} adında bir kullanıcı bulundu ancak avukat rolü yok`,
        };
      }

      // Müvekkil sayısını getir
      const clientCount = await prisma.clientLawyer.count({
        where: { userId: lawyer.id },
      });

      return {
        found: true,
        isLawyer: true,
        lawyerName: `${lawyer.firstName} ${lawyer.lastName}`,
        clientCount,
        message: `${lawyer.firstName} ${lawyer.lastName} adında ${clientCount} müvekkil bulunuyor`,
      };
    },
  },
  {
    name: 'get_lawyer_stats_by_name',
    description: 'İsim bazlı avukat ara ve istatistiklerini getir (müvekkil, dava sayısı vb.)',
    parameters: {
      type: 'object',
      properties: {
        lawyerName: {
          type: 'string',
          description: 'Avukatın adı (örn: "Yaşar Acar")',
        },
      },
      required: ['lawyerName'],
    },
    handler: async (params: any, userId: string, prisma: any) => {
      const lawyerName = params.lawyerName.toLowerCase();
      
      // Kullanıcıyı ad ve soyadına göre ara
      const users = await prisma.user.findMany({
        where: {
          OR: [
            {
              firstName: {
                contains: lawyerName.split(' ')[0],
                mode: 'insensitive',
              },
              lastName: {
                contains: lawyerName.split(' ')[1] || '',
                mode: 'insensitive',
              },
            },
            {
              firstName: {
                contains: lawyerName,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: lawyerName,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (users.length === 0) {
        return {
          found: false,
          message: `${params.lawyerName} adında bir kullanıcı bulunamadı`,
        };
      }

      // Avukat rolüne sahip kullanıcıyı bul
      const lawyer = users.find((u: any) => 
        u.roles.some((r: any) => r.role.name === 'LAWYER' || r.role.name === 'ASSOCIATE')
      );

      if (!lawyer) {
        return {
          found: true,
          isLawyer: false,
          message: `${params.lawyerName} adında bir kullanıcı bulundu ancak avukat rolü yok`,
        };
      }

      // Müvekkil sayısını getir
      const clientCount = await prisma.clientLawyer.count({
        where: { userId: lawyer.id },
      });

      // Dava sayılarını getir
      const caseCount = await prisma.caseLawyer.count({
        where: { userId: lawyer.id },
      });

      const activeCaseCount = await prisma.case.count({
        where: {
          lawyers: {
            some: {
              userId: lawyer.id,
            },
          },
          status: 'ACTIVE',
        },
      });

      return {
        found: true,
        isLawyer: true,
        lawyerName: `${lawyer.firstName} ${lawyer.lastName}`,
        clientCount,
        caseCount,
        activeCaseCount,
        message: `${lawyer.firstName} ${lawyer.lastName} adında ${clientCount} müvekkil, toplam ${caseCount} dava (${activeCaseCount} aktif) bulunuyor`,
      };
    },
  },
  {
    name: 'get_case_count',
    description: 'Avukatın toplam dava sayısını getir',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async (params: any, userId: string, prisma: any) => {
      const totalCount = await prisma.caseLawyer.count({
        where: { userId },
      });
      const activeCount = await prisma.case.count({
        where: {
          lawyers: {
            some: {
              userId,
            },
          },
          status: 'ACTIVE',
        },
      });
      return { totalCount, activeCount };
    },
  },
  {
    name: 'get_upcoming_deadlines',
    description: 'Yaklaşan son teslim tarihlerini getir (sonraki 7 gün içinde)',
    parameters: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Kaç gün sonrasına kadar bakılacak (varsayılan: 7)',
        },
      },
      required: [],
    },
    handler: async (params: any, userId: string, prisma: any) => {
      const days = params.days || 7;
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + days);

      const tasks = await prisma.caseTask.findMany({
        where: {
          case: {
            lawyers: {
              some: {
                userId,
              },
            },
          },
          dueDate: {
            gte: today,
            lte: futureDate,
          },
          completed: false,
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          case: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      return { tasks, count: tasks.length };
    },
  },
  {
    name: 'get_today_tasks',
    description: 'Bugünkü görevleri getir',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async (params: any, userId: string, prisma: any) => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const tasks = await prisma.caseTask.findMany({
        where: {
          case: {
            lawyers: {
              some: {
                userId,
              },
            },
          },
          dueDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          completed: false,
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          case: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      return { tasks, count: tasks.length };
    },
  },
  {
    name: 'search_clients',
    description: 'Müvekkil adına göre arama yap',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Arama sorgusu',
        },
      },
      required: ['query'],
    },
    handler: async (params: any, userId: string, prisma: any) => {
      const clientLawyers = await prisma.clientLawyer.findMany({
        where: {
          userId,
          client: {
            OR: [
              { firstName: { contains: params.query, mode: 'insensitive' } },
              { lastName: { contains: params.query, mode: 'insensitive' } },
              { email: { contains: params.query, mode: 'insensitive' } },
            ],
          },
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
        take: 10,
      });

      const clients = clientLawyers.map((cl: any) => cl.client);
      return { clients, count: clients.length };
    },
  },
  {
    name: 'search_cases',
    description: 'Dava başlığına göre arama yap',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Arama sorgusu',
        },
      },
      required: ['query'],
    },
    handler: async (params: any, userId: string, prisma: any) => {
      const caseLawyers = await prisma.caseLawyer.findMany({
        where: {
          userId,
          case: {
            OR: [
              { title: { contains: params.query, mode: 'insensitive' } },
              { description: { contains: params.query, mode: 'insensitive' } },
            ],
          },
        },
        include: {
          case: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              createdAt: true,
            },
          },
        },
        take: 10,
      });

      const cases = caseLawyers.map((cl: any) => cl.case);
      return { cases, count: cases.length };
    },
  },
];
