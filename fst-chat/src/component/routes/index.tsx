import { ReactTyped } from "react-typed";

export function HomePage() {
	return (
		<div className="h-screen bg-gradient-to-r from-[#010221] via-[#080c3b] to-[#5365ed] text-white justify-center items-center flex">
			<div
				id="hero"
				className="text-white justify-center items-center flex font-bold text-3xl"
			>
				<ReactTyped
					strings={[
						"Discuter avec vos ami et découvrez de nouvelles personnes qui partagent vos passions",
					]}
					typeSpeed={40}
				/>
			</div>
		</div>
	);
}
