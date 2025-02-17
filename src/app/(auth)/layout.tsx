export default function AuthLayouut({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      {children}
    </div>
  );
}
