import { createDialogWrapper } from 'dialog-manager-react';
import { lazy } from 'react';

const Dialogs = {
  confirmation: lazy(() => import('./dialogs/ConfirmationDialog')),
  addColumn: lazy(() => import('./dialogs/AddColumnDialog')),
  boardInfo: lazy(() => import('./dialogs/BoardInfoDialog')),
  boardExport: lazy(() => import('./dialogs/BoardExportDialog')),
  updateTimer: lazy(() => import('./dialogs/UpdateTimer')),
};

const { DialogManager, useDialogs } = createDialogWrapper(Dialogs);

export { DialogManager, useDialogs };
