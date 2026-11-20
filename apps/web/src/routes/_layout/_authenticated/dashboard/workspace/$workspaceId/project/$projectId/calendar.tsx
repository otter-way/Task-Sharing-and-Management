import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import CalendarToolbar from "@/components/calendar/calendar-toolbar";
import { CalendarBoard } from "@/components/calendar/calendar-board";
import { buildMonthWeeks } from "@/components/calendar/month-grid-model";
import { useCalendarNavigation } from "@/components/calendar/use-calendar-navigation";
import ProjectLayout from "@/components/common/project-layout";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import PageTitle from "@/components/page-title";
import { DisplaySection } from "@/components/project/display/display-section";
import { WeekStartControl } from "@/components/project/display/week-start-control";
import { ActiveFiltersBar } from "@/components/project/task-filters/active-filters-bar";
import { ProjectToolbar } from "@/components/project/toolbar/project-toolbar";
import { TaskCount } from "@/components/project/toolbar/task-count";
import { useProjectTaskView } from "@/components/project/toolbar/use-project-task-view";
import { LayoutSwitch } from "@/components/project/views/layout-switch";
import TaskDetailsSheet from "@/components/task/task-details-sheet";
import { useGetTasks } from "@/hooks/queries/task/use-get-tasks";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toCalendarTasks } from "@/lib/calendar-tasks";
import useGetProjectTaskRelations from "@/hooks/queries/task-relation/use-get-project-task-relations";
import { useUserPreferencesStore } from "@/store/user-preferences";

type CalendarSearchParams = {
  taskId?: string;
};

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/calendar",
)({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): CalendarSearchParams => ({
    taskId: typeof search.taskId === "string" ? search.taskId : undefined,
  }),
});

// Lanes are capped so a busy week cannot push a row taller than the viewport;
// anything past the cap surfaces as a per-day overflow hint. Phones use the
// agenda list instead of the grid.
const MAX_LANES_DESKTOP = 3;
const NO_RELATIONS = [] as const;

function RouteComponent() {
  const { t, i18n } = useTranslation();
  const { projectId, workspaceId } = Route.useParams();
  const { taskId } = Route.useSearch();
  const navigate = useNavigate();
  const { data: project, isLoading, isError } = useGetTasks(projectId);
  const {
    data: relationData,
    isLoading: relationsLoading,
    isError: relationsError,
  } = useGetProjectTaskRelations(projectId);
  const relations = relationsError
    ? NO_RELATIONS
    : (relationData ?? NO_RELATIONS);
  const weekStartsOn = useUserPreferencesStore((state) => state.weekStartsOn);
  const isMobile = useIsMobile();
  const view = useProjectTaskView({
    project,
    projectId,
    workspaceId,
    scope: "schedule",
  });
  const calendarMode = useUserPreferencesStore((state) => state.calendarMode);
  const setCalendarMode = useUserPreferencesStore(
    (state) => state.setCalendarMode,
  );
  const nav = useCalendarNavigation(calendarMode, weekStartsOn, i18n.language);
  const visibleMonth = nav.visibleMonth;
  const { user } = useAuth();
  const permissions = useWorkspacePermission();
  const assigneeFilter = view.filters.filters.assignee;
  const onlyMineActive =
    !!user && assigneeFilter?.length === 1 && assigneeFilter[0] === user.id;

  const allScheduledTasks = useMemo(
    () => toCalendarTasks(project, relations),
    [project, relations],
  );
  const scheduledTasks = useMemo(
    () => toCalendarTasks(project, relations, view.filters.filteredProject),
    [project, view.filters.filteredProject, relations],
  );

  const weeks = useMemo(
    () => buildMonthWeeks(visibleMonth, weekStartsOn),
    [visibleMonth, weekStartsOn],
  );

  const handleOpenTask = useCallback(
    (nextTaskId: string) => {
      navigate({ to: ".", search: { taskId: nextTaskId }, replace: true });
    },
    [navigate],
  );

  const handleCloseTaskSheet = useCallback(() => {
    navigate({ to: ".", search: {}, replace: true });
  }, [navigate]);

  return (
    <ProjectLayout
      projectId={projectId}
      workspaceId={workspaceId}
      activeView="calendar"
      toolbar={
        <ProjectToolbar
          view={view}
          display={
            <>
              <DisplaySection>
                <LayoutSwitch
                  workspaceId={workspaceId}
                  projectId={projectId}
                  currentRoute="calendar"
                  currentView="calendar"
                />
              </DisplaySection>
              <DisplaySection>
                <WeekStartControl />
              </DisplaySection>
            </>
          }
        />
      }
      summary={
        <TaskCount
          shown={scheduledTasks.length}
          total={allScheduledTasks.length}
        />
      }
      filterBar={
        <ActiveFiltersBar
          subjects={view.subjects}
          onClear={view.filters.clearFilters}
          customFieldValues={view.filters.customFieldValues}
        />
      }
    >
      <PageTitle
        title={
          project
            ? t("tasks:calendar.pageTitle", { name: project.name })
            : undefined
        }
      />
      <div className="flex h-full min-h-0 flex-col bg-background">
        <CalendarToolbar
          mode={calendarMode}
          onModeChange={(mode) => {
            nav.resetDirection();
            setCalendarMode(mode);
          }}
          label={nav.label}
          onPrevious={nav.previous}
          onNext={nav.next}
          onToday={nav.today}
          onlyMine={
            user
              ? {
                  active: onlyMineActive,
                  onToggle: () =>
                    view.filters.updateFilter(
                      "assignee",
                      onlyMineActive ? null : [user.id],
                    ),
                }
              : null
          }
        />

        {isLoading || relationsLoading ? (
          <div className="border-b border-border/80 px-4 py-3 text-center">
            <p className="text-sm text-muted-foreground">
              {t("common:empty.loading")}
            </p>
          </div>
        ) : isError ? (
          <div className="border-b border-border/80 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-destructive">
              {t("tasks:calendar.loadError")}
            </p>
          </div>
        ) : calendarMode === "week" ? null : allScheduledTasks.length === 0 ? (
          <div className="border-b border-border/80 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-foreground">
              {t("tasks:calendar.noTasks")}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("tasks:calendar.noTasksSubtitle")}
            </p>
          </div>
        ) : scheduledTasks.length === 0 ? (
          <div className="border-b border-border/80 px-4 py-3 text-center">
            <p className="text-sm text-muted-foreground">
              {t("tasks:filterBar.noMatches")}
            </p>
          </div>
        ) : null}

        {!isLoading && !relationsLoading && !isError && (
          <CalendarBoard
            mode={calendarMode}
            project={project}
            filteredProject={view.filters.filteredProject}
            monthTasks={scheduledTasks}
            weeks={weeks}
            visibleMonth={visibleMonth}
            weekDays={nav.weekDays}
            direction={nav.direction}
            maxLanes={MAX_LANES_DESKTOP}
            isMobile={isMobile}
            canMove={permissions.canUpdateTasks()}
            onOpenTask={handleOpenTask}
          />
        )}

        <TaskDetailsSheet
          taskId={taskId}
          projectId={projectId}
          workspaceId={workspaceId}
          onClose={handleCloseTaskSheet}
        />
      </div>
    </ProjectLayout>
  );
}
