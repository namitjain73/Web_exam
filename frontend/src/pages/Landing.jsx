const Landing = () => {
  return (
    <section className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Plan Trips With Your Team</h1>
        <p className="text-xl mb-6">Create teams, invite friends, track expenses & plan together.</p>

        <div className="flex justify-center gap-4">
          <a href="/login" className="px-6 py-3 bg-white text-blue-600 rounded font-semibold">Login</a>
          <a href="/register" className="px-6 py-3 bg-gray-900 rounded font-semibold">Register</a>
        </div>
      </div>
    </section>
  );
};

export default Landing;
