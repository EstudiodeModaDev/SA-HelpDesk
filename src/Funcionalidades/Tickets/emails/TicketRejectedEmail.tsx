import { Body, Column, Container, Head, Heading, Hr, Html, Preview, Row, Section, Text } from "@react-email/components";

export type TicketRejectedEmailProps = {
  solicitante: string;
  ticketId: string;
  espacioFisico: string;
  motivo: string;
  ticketUrl?: string;
};

const colors = {
  bg: "#f4f4f5",
  card: "#ffffff",
  border: "#e5e7eb",
  headerBg: "#dc2626",
  text: "#374151",
  muted: "#6b7280",
  labelBg: "#f9fafb",
  reasonBg: "#fef2f2",
  reasonBorder: "#fecaca",
  reasonText: "#991b1b",
};

export function TicketRejectedEmail({ solicitante, ticketId, espacioFisico, motivo, ticketUrl }: TicketRejectedEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu ticket {ticketId} no fue aprobado por el jefe de zona</Preview>
      <Body style={{ backgroundColor: colors.bg, margin: 0, padding: "40px 0", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <Container
          style={{
            maxWidth: 600,
            margin: "0 auto",
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Section style={{ backgroundColor: colors.headerBg, padding: 20, textAlign: "center" }}>
            <Heading as="h2" style={{ margin: 0, color: "#ffffff", fontSize: 22 }}>
              Ticket no aprobado
            </Heading>
          </Section>

          <Section style={{ padding: 24 }}>
            <Text style={{ margin: "0 0 16px", color: colors.text, fontSize: 15, lineHeight: "1.6" }}>
              Hola <strong>{solicitante}</strong>,
            </Text>
            <Text style={{ margin: "0 0 16px", color: colors.text, fontSize: 15, lineHeight: "1.6" }}>
              Tu ticket <strong>{ticketId}</strong> no fue aprobado por el jefe de zona.
            </Text>

            <Section style={{ border: `1px solid ${colors.border}`, borderRadius: 8, margin: "20px 0" }}>
              <Row>
                <Column style={{ padding: 10, background: colors.labelBg, fontWeight: "bold", borderBottom: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}`, width: "40%", fontSize: 14, color: colors.text }}>
                  ID del caso
                </Column>
                <Column style={{ padding: 10, borderBottom: `1px solid ${colors.border}`, fontSize: 14, color: colors.text }}>{ticketId}</Column>
              </Row>
              <Row>
                <Column style={{ padding: 10, background: colors.labelBg, fontWeight: "bold", borderRight: `1px solid ${colors.border}`, fontSize: 14, color: colors.text }}>
                  Espacio físico
                </Column>
                <Column style={{ padding: 10, fontSize: 14, color: colors.text }}>{espacioFisico}</Column>
              </Row>
            </Section>

            <Section style={{ backgroundColor: colors.reasonBg, border: `1px solid ${colors.reasonBorder}`, borderRadius: 8, padding: 16, margin: "20px 0" }}>
              <Text style={{ margin: "0 0 4px", fontSize: 12, fontWeight: "bold", color: colors.reasonText, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Motivo del rechazo
              </Text>
              <Text style={{ margin: 0, fontSize: 15, color: colors.reasonText, lineHeight: "1.6" }}>{motivo}</Text>
            </Section>

            <Text style={{ margin: 0, color: colors.text, fontSize: 15, lineHeight: "1.6" }}>
              Si consideras que esto es un error, comunícate con tu jefe de zona o crea un nuevo ticket.
            </Text>

            {ticketUrl ? (
              <Section style={{ textAlign: "center", margin: "28px 0 4px" }}>
                <a
                  href={ticketUrl}
                  style={{
                    display: "inline-block",
                    backgroundColor: colors.headerBg,
                    color: "#ffffff",
                    textDecoration: "none",
                    padding: "12px 24px",
                    borderRadius: 8,
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  Ver ticket en SA HelpDesk
                </a>
              </Section>
            ) : null}
          </Section>

          <Hr style={{ borderColor: colors.border, margin: 0 }} />

          <Section style={{ backgroundColor: colors.labelBg, padding: 16, textAlign: "center" }}>
            <Text style={{ margin: 0, fontSize: 12, color: colors.muted }}>
              Este es un mensaje automático generado por <strong>SA HelpDesk</strong>. Por favor, no respondas a este correo.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default TicketRejectedEmail;
