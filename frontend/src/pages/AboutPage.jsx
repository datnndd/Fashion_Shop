const AboutPage = () => {
    const teamMembers = [
        {
            name: 'Sarah Jenkins',
            role: 'Founder & Creative Lead',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfcxyQPG0Bg5EsrhdHw8gyFnoWdPgQ2pMz7H1_nFdUF8rV-jrPZgopTS4fBHGTwpbeW_ZBdRnlJcb6rqI7yo49TGJQWHWxpLz2naEz27zVwFdFKFqQZpqEQwJ6huhCaQZk7ZEyXP_HWnMEtd3tS2pn8fvNSS2mGFmQaPCEuYu6N_hIOe_eC0ymdSalH8A7F60vQItlUfU6ENtVzyIeZmrUTVxSetKP-GX15wuOxEykvY8jiF3Z7_AdxJqF4zMP0QJuFUR_b-rv3uw',
        },
        {
            name: 'Marcus Chen',
            role: 'Head of Design',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyCsXs9JAoyAyxzlRZwRIzmV9lQjsroIDpp5F2YGDyVMoNb9_xT9TaZTaufVr2vH5TOKgzqmxSjdw1kvGNQf9rDHF7aQ448438TXHdZAMMf0I-n6W0CqUH6pm1ZtM9fIMvvxhuiZ-q93C1PY8L9OsunsMeRivwGapXZVu7CcsabvUvaXzmJObKFDHmKstKMjdRi8uReHrMcNjFGPFqYPkHxzAPzZO8_gKCHRevLc3PCfzkoH7k4ecGx90c0WV_UvxGzs88kUEybL4',
        },
        {
            name: 'Elena Rodriguez',
            role: 'Color Specialist',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBx9dzkLUrfziea7z7AbFr8xaYt73wGvMMXANMYhT-YRP9SfV3Cw5rW-dkAZ_LjugXMd-zQcBYqYTkjgLKJpVuzk0-tMzWelTRGWfwhuR57sg6nqXNM9exTRWrXA0V6L_z97cJC59fNCCY0-OuUd_r2rybxaqmS3ekhvVGK-7HzXAWGrLPjuc2oJWOOQ6RYy9vEYgsZ9PcDkvl_HJESjodxVxTTMNI3qsq-hQ1rhM0C5i-DGk5wrSL_31XgmWy8SpAb-ssPnrpUcU',
        },
        {
            name: 'David Okonjo',
            role: 'Sustainability Lead',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxZl2K67Wi2z3rmou7xxeZy1I2MBLIZreA1rfji1Ij5bGH6Mfxl8IbcIElw6_6oTahMCVYpc2fXRSgdiPWiIrvA4zXerUwrA6Dx8LOsS5dCB4wQbYGCG5LLPHUPu2dSr4Jafke_EGbBx-E4M0kKQxN6akXgNOGBOYA1RuNgCE6Bw_YJT951E4BBgYHc3zr8eDV1Ej6F3jhKUi0XnzMAfiuDSnjloqHdfJxiaLPwh6FZTOg16Qfl9TS9xOKVqi9E6l8hQbMG733oWM',
        },
    ];

    const milestones = [
        { year: '2020', title: 'The Spark', icon: 'lightbulb', description: 'The concept was simple: reject the beige. BasicColor was founded in a small studio with 3 primary colors.' },
        { year: '2021', title: 'First Drop', icon: 'rocket_launch', description: 'Our "Neon Summer" collection sold out in 48 hours. We knew we weren\'t alone in craving saturation.' },
        { year: '2022', title: 'Global Reach', icon: 'public', description: 'From New York to Tokyo. We expanded shipping worldwide, proving color is a universal language.' },
        { year: '2023', title: 'The Revolution', icon: 'flag', description: 'Launched our sustainable dye initiative. Dominating the market with zero compromise on ethics.' },
    ];

    return (
        <div className="bg-[#221022] min-h-screen text-white font-[Space_Grotesk]">
            {/* Hero Section */}
            <div className="relative flex w-full flex-col">
                <div className="w-full flex justify-center py-10 md:py-20">
                    <div className="w-full max-w-[1280px] px-4 md:px-10">
                        <div className="relative overflow-hidden rounded-2xl bg-[#2d162d] min-h-[500px] md:min-h-[600px] flex items-center justify-center text-center p-8 border border-white/5">
                            {/* Abstract Background Elements */}
                            <div
                                className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
                                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(212, 17, 212, 0.4) 0%, rgba(34, 16, 34, 0) 70%)' }}
                            ></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#d411d4] blur-[120px] opacity-20 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col items-center max-w-3xl gap-6">
                                <span className="inline-flex items-center gap-2 rounded-full border border-[#d411d4]/30 bg-[#d411d4]/10 px-4 py-1.5 text-sm font-medium text-[#d411d4]">
                                    <span className="h-2 w-2 rounded-full bg-[#d411d4] animate-pulse"></span>
                                    EST. 2020
                                </span>
                                <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter uppercase">
                                    We Don't <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d411d4] to-purple-400">Do Grey.</span>
                                </h1>
                                <p className="text-slate-300 text-lg md:text-xl font-light max-w-xl leading-relaxed mt-4">
                                    Basic is Boring. Color is Power. We exist to disrupt the monochrome with high-voltage aesthetics.
                                </p>
                                <button className="mt-6 flex cursor-pointer items-center justify-center rounded-lg h-12 px-8 bg-[#d411d4] hover:bg-[#d411d4]/90 text-white text-base font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(212,17,212,0.3)] hover:shadow-[0_0_30px_rgba(212,17,212,0.5)]">
                                    Read The Manifesto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Origin Story */}
            <div className="w-full flex justify-center py-12 md:py-24">
                <div className="w-full max-w-[1280px] px-4 md:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-6 order-2 md:order-1">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-[#d411d4] text-sm font-bold tracking-widest uppercase">The Origin</h2>
                                <h3 className="text-white text-3xl md:text-5xl font-bold leading-tight">Rebelling Against The Sea of Beige</h3>
                            </div>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                BasicColor was born from a frustration with modern minimalism that stripped away all personality. We looked around and saw a world desaturated—muted tones, safe choices, and endless grey.
                            </p>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                We decided to act. We believe that what you wear affects how you feel, and how the world sees you. Our mission is simple: to reintroduce bold, unapologetic color into the everyday wardrobe without sacrificing clean, modern silhouettes.
                            </p>
                            <div className="pt-4">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-3xl font-bold text-white">50+</h4>
                                        <p className="text-sm text-slate-400 mt-1">Unique Shades</p>
                                    </div>
                                    <div>
                                        <h4 className="text-3xl font-bold text-white">100%</h4>
                                        <p className="text-sm text-slate-400 mt-1">Ethically Sourced</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative order-1 md:order-2 h-[500px] w-full rounded-xl overflow-hidden group">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDirzi1lD4sIUFLTdHrSWF7FC341_Q9Yyktcz4f9Cbpy3E-W2CF8868hcGF-gXE0Bc4w0pcT8NirE4lzZXB7ahxVUsRJ0SprO7P3Lrpi_vZ7bVfFMw6C7SEzfMmdF71OQbiRZFEFWjZyUGPaQlpg8ugBGr3ocB47-270WOAgXpwMqw-lKdG-Xuo70we0WFYjwtcKE6uefBq0QWPs1qILXe4S3-lWBGHWRN8uNJ9Nhn_ITjML1KVOEoRJNhhADRINuicqp5OlE9foTM")' }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#221022] via-transparent to-transparent opacity-80"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Philosophy Grid */}
            <div className="w-full flex justify-center py-12 md:py-24 bg-[#2d162d]/30">
                <div className="w-full max-w-[1280px] px-4 md:px-10">
                    <div className="mb-12">
                        <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight">Our Philosophy</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]">
                        {/* Card 1 */}
                        <div className="md:col-span-2 row-span-1 rounded-xl bg-[#2d162d] border border-white/5 p-8 flex flex-col justify-between hover:border-[#d411d4]/50 transition-colors group">
                            <div className="w-12 h-12 rounded-full bg-[#d411d4]/20 flex items-center justify-center text-[#d411d4] mb-4">
                                <span className="material-symbols-outlined">diversity_2</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Every Shade Welcome</h3>
                                <p className="text-slate-400 max-w-md group-hover:text-slate-200 transition-colors">
                                    We don't just sell clothes; we curate a spectrum. Inclusivity isn't a buzzword for us—it's the foundation of our palette. Every skin tone deserves a color that makes it shine.
                                </p>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="md:col-span-1 row-span-1 rounded-xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[#d411d4] mix-blend-multiply opacity-60 z-10 transition-opacity group-hover:opacity-40"></div>
                            <div
                                className="h-full w-full bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAa-X_LhAya4xs8xTg62zKEiFslR0c1AIvksZue_w6IbwyscKwBTM8kpaphbNcunmJgFKp6-H0_sLfbLIitb88XhhKm3jFnmWF6bCj50YBORKD17R-fpCiEsgee6hCZJ81eftQVgZlqraB17SAbelAs141Uk0-_WaUN1jcOf_AatwVTcPgrW-U47l4YxhRmSFxJ_LCLV49CKPwuN53uU3q6NHiBMVxUWJo1YPqodoWQp3-fegdreHy0mGgpsO2JukXeh8NwaXb4mYw")' }}
                            ></div>
                            <div className="absolute bottom-4 left-4 z-20">
                                <p className="text-white font-bold text-lg">Boldness</p>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="md:col-span-1 row-span-1 rounded-xl bg-[#2a152a] p-8 flex flex-col items-center justify-center text-center border border-white/5">
                            <h3 className="text-6xl font-black text-[#d411d4]/20 leading-none select-none">LOUD</h3>
                            <p className="text-white font-medium mt-4 z-10">Wear it loud. Silence is for libraries.</p>
                        </div>
                        {/* Card 4 */}
                        <div className="md:col-span-2 row-span-1 rounded-xl bg-gradient-to-br from-[#d411d4] to-[#8a0f8a] p-8 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute right-[-20px] top-[-20px] opacity-20 rotate-12">
                                <span className="material-symbols-outlined text-[150px] text-white">diamond</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-2">Quality That Lasts</h3>
                                <p className="text-white/90 max-w-lg text-lg">
                                    Fast fashion fades. Our colors don't. We use premium dyes and fabrics engineered to hold their vibrancy wash after wash.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="w-full flex justify-center py-12 md:py-24">
                <div className="w-full max-w-[960px] px-4 md:px-10">
                    <h2 className="text-white text-3xl font-bold mb-12 text-center">Milestones</h2>
                    <div className="grid grid-cols-[40px_1fr] gap-x-6 px-4">
                        {milestones.map((milestone, index) => (
                            <div key={milestone.year} className="contents">
                                <div className="flex flex-col items-center gap-1 pt-1">
                                    {index > 0 && <div className="w-[2px] bg-[#2d162d] h-4"></div>}
                                    <div className="text-[#d411d4] bg-[#221022] z-10">
                                        <span className="material-symbols-outlined">{milestone.icon}</span>
                                    </div>
                                    <div className="w-[2px] bg-[#2d162d] h-full grow min-h-[80px]"></div>
                                </div>
                                <div className="flex flex-1 flex-col pb-10">
                                    <p className="text-[#d411d4] text-xl font-bold leading-normal">{milestone.year}: {milestone.title}</p>
                                    <p className="text-slate-400 text-base font-normal leading-normal mt-1">{milestone.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="w-full flex justify-center py-12 md:py-24 bg-[#2d162d]">
                <div className="w-full max-w-[1280px] px-4 md:px-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div>
                            <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight">The Colorists</h2>
                            <p className="text-slate-400 mt-2">The minds behind the palette.</p>
                        </div>
                        <button className="text-[#d411d4] font-bold hover:text-white transition-colors flex items-center gap-2">
                            Join the Team <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamMembers.map((member) => (
                            <div key={member.name} className="group relative rounded-lg overflow-hidden cursor-pointer">
                                <div className="aspect-[3/4] bg-gray-800">
                                    <img
                                        alt={`Portrait of ${member.name}, ${member.role}`}
                                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        src={member.image}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-6">
                                    <h3 className="text-white font-bold text-lg">{member.name}</h3>
                                    <p className="text-[#d411d4] text-sm font-medium">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Footer */}
            <div className="w-full flex justify-center py-20 bg-[#221022] border-t border-white/5">
                <div className="w-full max-w-[600px] px-4 text-center">
                    <span className="material-symbols-outlined text-[#d411d4] text-5xl mb-6">mail</span>
                    <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">Join The Movement</h2>
                    <p className="text-slate-400 mb-8 text-lg">Get early access to our most vibrant drops. No spam, just color.</p>
                    <form className="flex flex-col sm:flex-row gap-3">
                        <input
                            className="flex-1 h-12 rounded-lg bg-[#2d162d] border border-white/10 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#d411d4] focus:ring-1 focus:ring-[#d411d4] transition-all"
                            placeholder="Enter your email"
                            type="email"
                        />
                        <button
                            type="button"
                            className="h-12 px-8 rounded-lg bg-[#d411d4] hover:bg-[#d411d4]/90 text-white font-bold transition-all shadow-lg shadow-[#d411d4]/20"
                        >
                            Subscribe
                        </button>
                    </form>
                    <div className="mt-12 flex justify-center gap-6 text-slate-500">
                        <a href="#" className="hover:text-[#d411d4] transition-colors">Instagram</a>
                        <a href="#" className="hover:text-[#d411d4] transition-colors">Twitter</a>
                        <a href="#" className="hover:text-[#d411d4] transition-colors">TikTok</a>
                    </div>
                    <p className="mt-8 text-xs text-slate-600">© 2023 BasicColor Inc. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
