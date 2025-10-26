import { json, type RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import User from '$lib/server/db/models/User';
import { requireAuth } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
	try {
		const authUser = requireAuth(event);
		if (authUser.role !== 'admin') {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await connectDB();

		const { id } = event.params as { id: string };
		if (!id) return json({ error: 'User ID required' }, { status: 400 });

		const user = await User.findById(id).select('-password_hash').lean();
		if (!user) return json({ error: 'User not found' }, { status: 404 });

		return json({ user });
	} catch (err) {
		console.error('Get user by id error', err);
		return json({ error: 'Failed to fetch user' }, { status: 500 });
	}
};