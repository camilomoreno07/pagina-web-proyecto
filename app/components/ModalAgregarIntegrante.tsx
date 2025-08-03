"use client";
import { useState } from "react";
import { FaUser } from "react-icons/fa";

interface ModalAgregarIntegranteProps {
  onClose: () => void;
  onSave: (integrante: any) => void;
}

export default function ModalAgregarIntegrante({ onClose, onSave }: ModalAgregarIntegranteProps) {
  const [usuario, setUsuario] = useState("");

  const handleSave = () => {
    if (!usuario.trim()) return;
    onSave({ usuario }); // aquí puedes ampliar a { nombre, apellido, usuario, rol }
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-2">Agregar integrante</h2>
        <p className="text-gray-600 mb-4">
          Digite y seleccione el nombre del integrante que desea agregar
        </p>

        <div className="relative mb-6">
          <FaUser className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Nombre o usuario"
            className="pl-10 pr-4 py-2 border rounded w-full focus:ring-2 focus:ring-primary-40"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-40 text-white rounded hover:bg-primary-50"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
