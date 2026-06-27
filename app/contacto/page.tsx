"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

const CONTACT = {
  email: "contacto@rokko.cl",
  whatsapp: "56912345678",
  phone: "+56912345678",
};

const WHATSAPP_URL = `https://wa.me/${CONTACT.whatsapp}`;

export default function ContactoPage() {
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    whatsapp: "",
    solicitud: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.nombre.trim()) nextErrors.nombre = "El nombre es obligatorio";
    if (!form.solicitud.trim()) nextErrors.solicitud = "Describe tu solicitud";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const subject = `Contacto ROKKO - ${form.nombre}`;
    const body = `
Nombre: ${form.nombre}
Empresa: ${form.empresa || "No indicada"}
WhatsApp / Teléfono: ${form.whatsapp || "No indicado"}

Solicitud:
${form.solicitud}
    `.trim();

    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setIsSubmitted(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Hola ROKKO, quiero solicitar una cotización.

Nombre: ${form.nombre || ""}
Empresa: ${form.empresa || ""}
WhatsApp: ${form.whatsapp || ""}

Necesito cotizar:
${form.solicitud || ""}`,
  );

  const handleReset = () => {
    setForm({ nombre: "", empresa: "", whatsapp: "", solicitud: "" });
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <main className="flex min-h-[calc(100dvh-80px)] items-center justify-center bg-[#f4f7f9] p-4 font-sans text-[#071827] sm:p-6 lg:p-8">
      {/* Fondos difuminados decorativos */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-[#00b8c8]/10 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-[#087381]/10 blur-[100px]" />

      {/* TARJETA UNIFICADA (Split Container) */}
      <div className="relative z-10 w-full max-w-[1100px] overflow-hidden rounded-[2rem] border border-slate-300 bg-white shadow-[0_32px_64px_-16px_rgba(7,24,39,0.15)] lg:grid lg:grid-cols-[0.85fr_1.15fr]">
        
        {/* LADO IZQUIERDO: Panel Oscuro Intenso */}
        <aside className="relative flex flex-col justify-between bg-[#071827] p-8 sm:p-10 lg:p-12">
          {/* Luces de fondo internas */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#00b8c8]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#087381]/40 blur-3xl" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#00e5ff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff]" />
              Contacto comercial
            </span>

            {/* ¡CORREGIDO! Usamos colores hexadecimales nativos en CSS inline para asegurar que NO se oscurezca bajo ningún motivo */}
            <h1 
              style={{ color: '#ffffff' }} 
              className="mt-6 text-[32px] font-black leading-[1.1] tracking-[-0.04em] sm:text-[38px]"
            >
              Hablemos de tu próxima <span className="text-[#00e5ff]">cotización.</span>
            </h1>

            <p style={{ color: '#cbd5e1' }} className="mt-4 text-[14px] font-normal leading-relaxed">
              Cuéntanos qué prendas necesitas, volumen aproximado, aplicación de logo y fecha objetivo.
            </p>

            {/* Fichas de contacto */}
            <div className="mt-8 space-y-3">
              <ContactRow icon={<Mail />} label="Escríbenos por Correo" value={CONTACT.email} />
              <ContactRow icon={<MessageCircle />} label="Chat de WhatsApp" value={`+${CONTACT.whatsapp}`} />
              <ContactRow icon={<Phone />} label="Línea Directa" value={CONTACT.phone} />
            </div>
          </div>

          <div className="relative z-10 mt-10 lg:mt-auto">
            <Link
              href="/"
              style={{ color: '#94a3b8' }}
              className="inline-flex items-center gap-2 text-[13px] font-bold transition-colors duration-200 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al catálogo
            </Link>
          </div>
        </aside>

        {/* LADO DERECHO: Formulario de Solicitud */}
        <section className="bg-white p-8 sm:p-10 lg:p-12">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#087381]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#087381]">
                Solicitud rápida
              </span>
              <h2 className="mt-2 text-[26px] font-black tracking-[-0.03em] text-[#071827] sm:text-[30px]">
                Envía tus datos base
              </h2>
            </div>
            <p className="max-w-[240px] text-[12px] font-medium leading-relaxed text-slate-400 sm:text-right">
              Puedes despachar vía email o directo a WhatsApp con un click.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Nombre completo"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                error={errors.nombre}
                placeholder="Ej: Juan Pérez"
              />
              <Field
                label="Empresa"
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                placeholder="Nombre de tu empresa"
              />
              <Field
                label="WhatsApp / Celular"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="+56 9..."
              />
            </div>

            <Field
              label="Detalle de tu solicitud"
              name="solicitud"
              value={form.solicitud}
              onChange={handleChange}
              required
              error={errors.solicitud}
              isTextarea
              rows={5}
              placeholder="Ej: Necesitamos una cotización de 50 poleras corporativas tipo polo con el logo bordado..."
            />

            {/* Acciones del formulario */}
            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#071827] px-6 text-[13px] font-bold text-white transition-all duration-200 hover:bg-[#087381] active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                Enviar por correo
              </button>

              <a
                href={`${WHATSAPP_URL}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-[13px] font-bold text-[#087381] transition-all duration-200 hover:border-[#00b8c8] hover:bg-[#00b8c8]/5 active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>

              <a
                href={`tel:${CONTACT.phone}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-[13px] font-bold text-slate-600 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]"
              >
                <Phone className="h-4 w-4" />
                Llamar
              </a>
            </div>
          </form>
        </section>

      </div>

      {isSubmitted && (
        <SuccessOverlay
          onClose={handleReset}
          nombre={form.nombre}
          email={CONTACT.email}
        />
      )}
    </main>
  );
}

{/* COMPONENTE INTERNO: Filas de Contacto Izquierdo */}
function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-white/[0.1] bg-white/[0.05] p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00b8c8]/20 text-[#00e5ff] [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      <div className="min-w-0">
        <p style={{ color: '#94a3b8' }} className="text-[10px] font-medium tracking-wider">
          {label}
        </p>
        <p style={{ color: '#f1f5f9' }} className="mt-0.5 truncate text-[13px] font-bold">
          {value}
        </p>
      </div>
    </div>
  );
}

{/* COMPONENTE INTERNO: Inputs definidos con borde sólido slate-400 */}
function Field({
  label,
  name,
  value,
  onChange,
  required,
  error,
  isTextarea = false,
  rows = 3,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  isTextarea?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  const id = `field-${name}`;
  const hasError = !!error;

  // ¡CORREGIDO! Cambiado border-slate-200 a border-slate-400 para que el borde sea perfectamente visible y definido en pantallas normales.
  const className = `w-full rounded-xl border bg-white px-4 py-3 text-[13px] font-semibold text-[#071827] transition-all duration-200 placeholder:text-slate-400 focus:border-[#087381] focus:outline-none focus:ring-4 focus:ring-[#087381]/10 ${
    hasError ? "border-red-500 bg-red-50/20" : "border-slate-400 hover:border-slate-500"
  }`;

  return (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className="mb-1.5 text-[11px] font-bold text-slate-700"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {isTextarea ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows}
          placeholder={placeholder}
          className={`${className} resize-none`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
      ) : (
        <input
          id={id}
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={className}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
      )}

      {hasError && (
        <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

{/* COMPONENTE INTERNO: Modal de Éxito */}
function SuccessOverlay({
  onClose,
  nombre,
  email,
}: {
  onClose: () => void;
  nombre: string;
  email: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#071827]/40 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl border border-slate-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f9fa] text-[#087381]">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <h3 className="mt-4 text-xl font-black text-[#071827]">
          ¡Solicitud preparada!
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Se ha abierto tu cliente de correo para revisar los detalles. <span className="font-bold text-slate-700">{nombre}</span>, si no se abre automáticamente, escríbenos a:
          <a href={`mailto:${email}`} className="block mt-1 font-bold text-[#087381] hover:underline">
            {email}
          </a>
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[#071827] py-2.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#087381]"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}