export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { nombre, email, telefono, tipo, mensaje } = body;

  if (!nombre || !email || !mensaje) {
    return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
      <div style="background:#111;padding:24px 32px;border-radius:4px 4px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:2px">RT ARQUITECTOS</h1>
        <p style="color:#888;margin:4px 0 0;font-size:12px">Nueva consulta desde el sitio web</p>
      </div>
      <div style="border:1px solid #e5e5e5;border-top:none;padding:32px;border-radius:0 0 4px 4px">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;width:140px;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Nombre</td>
            <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:15px">${nombre}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Email</td>
            <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:15px"><a href="mailto:${email}" style="color:#C0392B">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Teléfono</td>
            <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:15px">${telefono || '—'}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Tipo de proyecto</td>
            <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:15px">${tipo || '—'}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px 12px 0;color:#888;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;vertical-align:top">Mensaje</td>
            <td style="padding:12px 0;font-size:15px;line-height:1.6">${mensaje.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #f0f0f0">
          <a href="mailto:${email}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;letter-spacing:1px;border-radius:2px">RESPONDER A ${nombre.toUpperCase()}</a>
        </div>
      </div>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RT Arquitectos <onboarding@resend.dev>',
        to: ['ricardotorrejon2@gmail.com'],
        subject: `Nueva consulta de ${nombre} — RT Arquitectos`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
