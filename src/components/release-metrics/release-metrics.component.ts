import { Component, ChangeDetectionStrategy, inject, computed, signal, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReleaseService } from '../../services/release.service';

// Make D3 available in the component
declare const d3: any;

interface ChartData {
  status: string;
  count: number;
}

@Component({
  selector: 'app-release-metrics',
  templateUrl: './release-metrics.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReleaseMetricsComponent {
  private releaseService = inject(ReleaseService);
  private allReleases = this.releaseService.releases;
  
  chartContainer = viewChild<ElementRef>('chartContainer');

  readonly totalReleases = computed(() => this.allReleases().length);
  readonly completedReleases = computed(() => this.allReleases().filter(r => r.status === 'Completed').length);
  readonly inProgressReleases = computed(() => this.allReleases().filter(r => r.status === 'In Progress').length);
  readonly blockedReleases = computed(() => this.allReleases().filter(r => r.status === 'Blocked').length);
  
  private readonly releasesByStatus = computed<ChartData[]>(() => {
    const statusCounts = this.allReleases().reduce((acc, release) => {
      acc[release.status] = (acc[release.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  });

  constructor() {
    effect(() => {
      const data = this.releasesByStatus();
      if (data && data.length > 0 && this.chartContainer()) {
        this.createDonutChart(data);
      }
    }, { allowSignalWrites: true });
  }

  private createDonutChart(data: ChartData[]): void {
    const container = this.chartContainer()?.nativeElement;
    if (!container) return;
    
    // Clear previous chart
    d3.select(container).select('svg').remove();

    const width = 300, height = 300, margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(container)
      .append('svg')
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.status))
      .range(['#10B981', '#3B82F6', '#EF4444']); // emerald, sky, red

    // FIX: Removed generic type argument from d3.pie() as it's not allowed on an untyped (any) function call.
    const pie = d3.pie()
      .value((d: ChartData) => d.count)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);
      
    const path = svg.selectAll('path')
      .data(pie(data))
      .enter().append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => color(d.data.status))
      .attr('stroke', '#1E293B') // slate-800
      .style('stroke-width', '2px')
      .style('opacity', 0.9)
      .on('mouseover', function() {
        d3.select(this).style('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 0.9);
      });

    // Add a title in the middle
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "1.5rem")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(`${this.totalReleases()}`);

     svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-1.5em")
        .style("font-size", "0.8rem")
        .style("fill", "#94A3B8") // slate-400
        .text(`Total Releases`);
  }
}