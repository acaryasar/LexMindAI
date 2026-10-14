import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';

describe('AuthController.deleteAccount', () => {
  it('deletes the signed-in user, ignoring any id in the body', async () => {
    const calls: Array<[string, string]> = [];
    const accountDeletion = { deleteOwnAccount: async (id: string, pw: string) => void calls.push([id, pw]) };
    const controller = new AuthController({} as any, accountDeletion as any);

    const result = await controller.deleteAccount({ user: { id: 'u7' } }, { password: 'Sifre1234!x', userId: 'someone-else' } as any);

    expect(calls).toEqual([['u7', 'Sifre1234!x']]);
    expect(result).toEqual({ message: 'Hesabınız silindi' });
  });

  it('lets the service errors through unchanged', async () => {
    const accountDeletion = {
      deleteOwnAccount: async () => {
        throw new BadRequestException('Şifre hatalı');
      },
    };
    const controller = new AuthController({} as any, accountDeletion as any);
    await expect(controller.deleteAccount({ user: { id: 'u1' } }, { password: 'x' })).rejects.toBeInstanceOf(BadRequestException);
  });
});
