import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableColumn, type DataTableSelection } from './data-table';
import { Button } from '@/components/ui/button';

interface Row {
  id: string;
  name: string;
  email: string;
}

const rows: Row[] = [
  { id: 'r1', name: 'First row', email: 'first@demo.com' },
  { id: 'r2', name: 'Second row', email: 'second@demo.com' },
];

const columns: readonly DataTableColumn<Row>[] = [
  { key: 'name', header: 'Name', cell: (row) => row.name },
  { key: 'email', header: 'Email', hideBelow: 'xl', width: 'w-48', cell: (row) => row.email },
];

const at = (items: HTMLElement[], index: number) => {
  const item = items[index];
  if (!item) throw new Error(`no element at index ${index}`);
  return item;
};

const rowAt = (index: number) => {
  const row = rows[index];
  if (!row) throw new Error(`no row at index ${index}`);
  return row;
};

const setViewport = (matches: boolean) => {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('min-width') ? matches : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
};

describe('DataTable', () => {
  beforeEach(() => {
    setViewport(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the columns of the list as a table', () => {
    render(<DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />);

    const table = screen.getByRole('table');
    expect(within(table).getByText('Name')).toBeInTheDocument();
    expect(within(table).getByText('First row')).toBeInTheDocument();
    expect(screen.getAllByText('Second row')).toHaveLength(1);
  });

  it('stacks every column as a labelled row on a narrow screen', () => {
    setViewport(false);

    render(<DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('First row')).toBeInTheDocument();
    // The column that the table hides on narrow screens stays reachable through its label.
    expect(screen.getAllByText('Email')).toHaveLength(rows.length);
    expect(screen.getByText('first@demo.com')).toBeInTheDocument();
  });

  it('shows the loading, empty and error states', () => {
    const { rerender } = render(
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={(row) => row.id}
        isLoading
        emptyTitle="Nothing here"
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();

    rerender(
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={(row) => row.id}
        emptyTitle="Nothing here"
        emptyDescription="Add a record to start."
      />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Add a record to start.')).toBeInTheDocument();

    rerender(
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={(row) => row.id}
        error="Forbidden."
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText('Forbidden.')).toBeInTheDocument();
  });

  it('selects a single row without opening it', () => {
    const onRowClick = vi.fn();

    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        onRowClick={onRowClick}
        selection={{ selected: [], onChange: () => {} }}
      />,
    );

    fireEvent.click(at(screen.getAllByRole('checkbox', { name: 'Select row' }), 0));

    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('shows the bulk action bar with the selected records', async () => {
    const onSelect = vi.fn();

    function Wrapper() {
      const [selected, setSelected] = useState<Row[]>([]);
      const selection: DataTableSelection<Row> = {
        selected,
        onChange: setSelected,
        actions: [{ label: 'Suspend', onSelect }],
      };
      return (
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} selection={selection} />
      );
    }

    render(<Wrapper />);

    fireEvent.click(at(screen.getAllByRole('checkbox', { name: 'Select row' }), 0));

    await waitFor(() => expect(screen.getByText('1 selected')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Suspend' }));
    expect(onSelect).toHaveBeenCalledWith([rowAt(0)]);
  });

  it('selects every record from the header and clears the selection again', async () => {
    function Wrapper() {
      const [selected, setSelected] = useState<Row[]>([]);
      return (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          selection={{ selected, onChange: setSelected }}
        />
      );
    }

    render(<Wrapper />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));

    await waitFor(() => expect(screen.getByText('2 selected')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));

    await waitFor(() => expect(screen.queryByText('2 selected')).not.toBeInTheDocument());
  });

  it('hides a bulk action that does not apply to the selection', async () => {
    function Wrapper() {
      const [selected, setSelected] = useState<Row[]>([]);
      const selection: DataTableSelection<Row> = {
        selected,
        onChange: setSelected,
        actions: [
          { label: 'Suspend', onSelect: () => {} },
          { label: 'Reactivate', isVisible: (picked) => picked.length === 2, onSelect: () => {} },
        ],
      };
      return (
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} selection={selection} />
      );
    }

    render(<Wrapper />);

    fireEvent.click(at(screen.getAllByRole('checkbox', { name: 'Select row' }), 0));

    await waitFor(() => expect(screen.getByText('1 selected')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Reactivate' })).not.toBeInTheDocument();
  });

  it('drops rows that are no longer listed from the selection', async () => {
    function Wrapper() {
      const [selected, setSelected] = useState<Row[]>([]);
      const [list, setList] = useState(rows);
      return (
        <>
          <button type="button" onClick={() => setList([rowAt(0)])}>
            Show one row
          </button>
          <DataTable
            columns={columns}
            rows={list}
            rowKey={(row) => row.id}
            selection={{ selected, onChange: setSelected }}
          />
        </>
      );
    }

    render(<Wrapper />);

    fireEvent.click(at(screen.getAllByRole('checkbox', { name: 'Select row' }), 1));
    await waitFor(() => expect(screen.getByText('1 selected')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Show one row' }));

    await waitFor(() => expect(screen.queryByText('1 selected')).not.toBeInTheDocument());
  });
});

describe('DataTable identity and row actions', () => {
  beforeEach(() => {
    setViewport(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('generates stable unique keys when an API row key is missing or unknown', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const incompleteRows = [
      { source: 'Organic', sessions: 12 },
      { source: 'Paid Search', sessions: 8 },
    ];
    const incompleteColumns: readonly DataTableColumn<(typeof incompleteRows)[number]>[] = [
      { key: 'source', header: 'Source', cell: (row) => row.source },
      { key: 'sessions', header: 'Sessions', cell: (row) => row.sessions },
    ];

    render(
      <DataTable
        columns={incompleteColumns}
        rows={incompleteRows}
        rowKey={() => 'unknown'}
      />,
    );

    expect(screen.getByText('Organic')).toBeInTheDocument();
    expect(screen.getByText('Paid Search')).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('same key'),
      expect.anything(),
    );
  });

  it('renders row actions only once when legacy action columns and shared actions are both supplied', () => {
    const edit = vi.fn();
    const duplicateColumns: readonly DataTableColumn<Row>[] = [
      ...columns,
      {
        key: 'actions',
        header: 'Legacy Actions',
        cell: () => <Button size="sm" onClick={() => {}}>Duplicate Edit</Button>,
      },
    ];

    render(
      <DataTable
        columns={duplicateColumns}
        rows={[rows[0]!]}
        rowKey={(row) => row.id}
        actions={{
          header: 'Actions',
          render: () => (
            <div className="flex gap-2">
              <Button size="sm" onClick={edit}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => {}}>Delete</Button>
            </div>
          ),
        }}
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Legacy Actions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Duplicate Edit' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Row actions' })).toHaveLength(1);
  });

  it('keeps row keys unique when incomplete API rows are identical', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const duplicateRows = [
      { source: 'Organic', sessions: 12 },
      { source: 'Organic', sessions: 12 },
    ];
    const incompleteColumns: readonly DataTableColumn<(typeof duplicateRows)[number]>[] = [
      { key: 'source', header: 'Source', cell: (row) => row.source },
      { key: 'sessions', header: 'Sessions', cell: (row) => row.sessions },
    ];

    render(
      <DataTable
        columns={incompleteColumns}
        rows={duplicateRows}
        rowKey={() => 'unknown'}
      />,
    );

    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('same key'),
      expect.anything(),
    );
  });

  it('does not render a duplicate legacy actions column on mobile cards', () => {
    setViewport(false);
    const duplicateColumns: readonly DataTableColumn<Row>[] = [
      ...columns,
      {
        key: 'actions',
        header: 'Legacy Actions',
        cell: () => <Button size="sm" onClick={() => {}}>Duplicate Edit</Button>,
      },
    ];

    render(
      <DataTable
        columns={duplicateColumns}
        rows={[rows[0]!]}
        rowKey={(row) => row.id}
        actions={{
          header: 'Actions',
          render: () => (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => {}}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => {}}>Delete</Button>
            </div>
          ),
        }}
      />,
    );

    expect(screen.queryByText('Legacy Actions')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Duplicate Edit' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Row actions' })).toHaveLength(1);
  });

  it('combines multiple row action buttons into one shared kebab menu', () => {
    const edit = vi.fn();
    const remove = vi.fn();
    render(
      <DataTable
        columns={columns}
        rows={[rows[0]!]}
        rowKey={(row) => row.id}
        actions={{
          header: 'Actions',
          render: () => (
            <div className="flex gap-2">
              <Button size="sm" onClick={edit}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={remove}>Delete</Button>
            </div>
          ),
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Row actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(edit).toHaveBeenCalledTimes(1);
    expect(remove).not.toHaveBeenCalled();
  });
});
