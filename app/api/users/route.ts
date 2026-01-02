import { NextRequest, NextResponse } from 'next/server';
import userDB from '@/lib/database';
import bcrypt from 'bcryptjs';

// Verificar se o usuário é admin
async function verifyAdmin(token: string): Promise<boolean> {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');
    const user = userDB.findById(parseInt(userId));
    return user?.role === 'admin';
  } catch {
    return false;
  }
}

// GET - Listar usuários (apenas admin)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token || !(await verifyAdmin(token))) {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const users = userDB.listUsers();
    const count = userDB.countUsers();

    return NextResponse.json({
      success: true,
      users,
      count
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { message: 'Erro no servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar usuário (apenas admin)
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token || !(await verifyAdmin(token))) {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { message: 'ID do usuário não fornecido' },
        { status: 400 }
      );
    }

    // Não permitir deletar o próprio usuário admin
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [currentUserId] = decoded.split(':');
    
    if (parseInt(currentUserId) === parseInt(userId)) {
      return NextResponse.json(
        { message: 'Você não pode deletar sua própria conta' },
        { status: 400 }
      );
    }

    const success = userDB.deleteUser(parseInt(userId));

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    }

    return NextResponse.json(
      { message: 'Usuário não encontrado' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json(
      { message: 'Erro no servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário (apenas admin)
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token || !(await verifyAdmin(token))) {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, username, email, role, password } = body;

    if (!id) {
      return NextResponse.json(
        { message: 'ID do usuário não fornecido' },
        { status: 400 }
      );
    }

    const updates: any = {};
    
    if (username) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (role) updates.role = role;
    if (password) {
      updates.password = bcrypt.hashSync(password, 10);
    }

    const success = userDB.updateUser(id, updates);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Usuário atualizado com sucesso'
      });
    }

    return NextResponse.json(
      { message: 'Usuário não encontrado ou nenhuma alteração feita' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { message: 'Erro no servidor' },
      { status: 500 }
    );
  }
}
