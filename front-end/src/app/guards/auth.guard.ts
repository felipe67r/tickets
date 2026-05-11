import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const isLogged = sessionStorage.getItem('usuarioLogado');

  if (isLogged === 'true') {
    return true;
  } else {
    // Pegamos a URL que o usuário tentou acessar (ex: /relatorios)
    const returnUrl = state.url;
    
    // Redireciona para o login passando a rota de retorno como parâmetro
    router.navigate(['/login'], { queryParams: { returnUrl: returnUrl } });
    return false;
  }
};