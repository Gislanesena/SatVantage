/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint não está instalado neste projeto (sem eslint/eslint-config-next em
  // package.json) — o lint automático do `next build` quebra tentando rodar
  // mesmo assim ("Invalid Options: useEslintrc, extensions"). Sem lint real
  // configurado, não há o que checar; desligar aqui evita o erro sem
  // precisar instalar dependências novas.
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
