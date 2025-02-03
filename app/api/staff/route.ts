import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { email, firstName, lastName } = await req.json();

    // Verify the requester is an admin
    const user = await clerkClient.users.getUser(userId!);
    if (user.publicMetadata.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate username (e.g., john.doe.123)
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Math.floor(Math.random() * 1000)}`;

    // Create staff member in Clerk
    const newUser = await clerkClient.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      username,
      publicMetadata: {
        role: 'staff',
        companyId: user.publicMetadata.companyId,
      },
      password: Math.random().toString(36).slice(-8), // Generate random password
    });

    return NextResponse.json({ userId: newUser.id });
  } catch (error) {
    console.error('Staff creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 