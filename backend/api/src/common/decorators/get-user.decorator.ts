import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // El usuario se adjunta al request gracias a nuestra JwtStrategy
    const user = request.user; 
    
    return data ? user?.[data] : user;
  },
);