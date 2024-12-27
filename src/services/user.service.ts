import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { UserRegisterDto, UserUpdateDto } from '@/interfaces/user';
import User from '@/models/user.model';
import { hashPassword } from '@/utils/auth';

@Service()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(userRegisterDto: UserRegisterDto) {
    const user = this.userRepository.create({
      full_name: userRegisterDto.full_name,
      telephone: userRegisterDto.telephone,
      address: userRegisterDto.address,
      email: userRegisterDto.email,
      role: userRegisterDto.role,
      password: userRegisterDto.password,
    });

    return await this.userRepository.save(user);
  }
  async updateUser(userId: string, user: UserUpdateDto) {
    const partialEntity = user;
    return this.userRepository.update(userId, partialEntity);
  }
  async updatePassword(userId: string, password: string) {
    const hashedPassword = await hashPassword(password);
    return this.userRepository.update(userId, { password: hashedPassword });
  }
  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return user;
  }

  async findById(id: string) {
    const user = await this.userRepository.findOneOrFail(id);
    return user;
  }
  async verifyEmailById(id: string) {
    const user = await this.userRepository.findOneOrFail(id);
    await this.userRepository.update(user.id, { is_verified: true });
    return user;
  }

  async getStatistics() {
    const count = await this.userRepository.count();
    return count;
  }
}
