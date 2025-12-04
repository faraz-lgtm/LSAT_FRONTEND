import { OrganizationsEditDialog } from './organizations-edit-dialog'
import { OrganizationsDeleteDialog } from './organizations-delete-dialog'
import { useOrganizations } from './organizations-provider'

export function OrganizationsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useOrganizations()
  
  return (
    <>
      {/* Create/Add Organization Dialog */}
      <OrganizationsEditDialog
        key='organization-add'
        open={open === 'add'}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null)
          } else {
            setOpen('add')
          }
        }}
      />

      {/* Edit/Delete dialogs for existing organizations */}
      {currentRow && (
        <>
          <OrganizationsEditDialog
            key={`organization-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              } else {
                setOpen('edit')
              }
            }}
            currentRow={currentRow}
          />

          <OrganizationsDeleteDialog
            key={`organization-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              } else {
                setOpen('delete')
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}

