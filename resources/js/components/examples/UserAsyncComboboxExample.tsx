import { AsyncCombobox } from '@/components/ui/async-combobox'
import { paginated } from '@/routes/api/users'
import { useState } from 'react'

/**
 * Ejemplo de uso del AsyncCombobox con la API unificada de usuarios
 *
 * La API /api/users/paginated ahora maneja tanto:
 * - Paginación completa para tablas (formato estándar)
 * - Búsqueda para combobox (formato: array de {value, label})
 *
 * El formato se determina por el parámetro 'format=combobox'
 */
export const UserAsyncComboboxExample = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | number>('')

  return (
    <div className="p-6 max-w-md">
      <h3 className="mb-4 font-medium text-lg">Seleccionar Usuario</h3>

      <AsyncCombobox
        searchUrl={paginated().url} // Usa la misma API que la tabla
        value={selectedUserId}
        onChange={setSelectedUserId}
        placeholder="Buscar usuario..."
        emptyMessage="No se encontraron usuarios."
        show={10} // Mostrar 10 resultados máximo
        debounceMs={300} // Esperar 300ms antes de buscar
      />

      {selectedUserId && (
        <div className="bg-gray-100 dark:bg-gray-800 mt-4 p-3 rounded">
          <p className="text-sm">
            <strong>ID seleccionado:</strong> {selectedUserId}
          </p>
        </div>
      )}

      <div className="space-y-2 mt-6 text-gray-600 dark:text-gray-400 text-sm">
        <h4 className="font-medium text-black dark:text-white">
          Cómo funciona:
        </h4>
        <ul className="space-y-1 pl-4">
          <li>• Usa la misma API que la tabla de usuarios</li>
          <li>
            • Añade automáticamente <code>format=combobox</code>
          </li>
          <li>• Busca por nombre y email</li>
          <li>• Cachea la opción seleccionada</li>
          <li>• Maneja errores automáticamente</li>
        </ul>
      </div>
    </div>
  )
}

export default UserAsyncComboboxExample
